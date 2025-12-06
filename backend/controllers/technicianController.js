const Booking = require('../models/Booking');
const Technician = require('../models/Technician');
const mongoose = require('mongoose');
const OTP = require('../models/OTP');
const User = require('../models/User');
const { sendOTP } = require('../utils/emailService');
const { sendOTPNotification, sendBookingUpdateNotification } = require('../utils/notificationService');

// Helper to generate 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.getProfile = async (req, res) => {
  try {
    const techId = req.user.id;
    const tech = await Technician.findById(techId).select('-password');
    if (!tech) return res.status(404).json({ message: 'Technician not found' });

    // Compute stats from bookings: total, completed, pending, today's jobs, average rating
    const todayStr = new Date().toISOString().split('T')[0];

    const [totalJobs, completedJobs, pendingJobs, todayJobs, ratingAgg] = await Promise.all([
      Booking.countDocuments({ technician: techId }),
      Booking.countDocuments({ technician: techId, status: 'Completed' }),
      Booking.countDocuments({ technician: techId, status: 'Pending' }),
      Booking.countDocuments({ technician: techId, date: todayStr }),
      Booking.aggregate([
        { $match: { technician: new mongoose.Types.ObjectId(techId), rating: { $ne: null } } },
        { $group: { _id: null, avg: { $avg: '$rating' } } }
      ])
    ]);

    const avgRating = (Array.isArray(ratingAgg) && ratingAgg[0] && ratingAgg[0].avg) ? ratingAgg[0].avg : 0;

    // Return technician with computed stats to avoid relying on separate DB fields
    const technician = tech.toObject();
    technician.totalJobs = totalJobs;
    technician.completedJobs = completedJobs;
    technician.pendingJobs = pendingJobs;
    technician.todayJobs = todayJobs;
    technician.avgRating = avgRating;

    res.json({ technician });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Returns bookings assigned to technician and public pending bookings
exports.getBookings = async (req, res) => {
  try {
    const techId = req.user.id;

    // Only return bookings assigned to this technician.
    // Exclude unassigned / pending bookings because technicians cannot accept those directly.
    const bookings = await Booking.find({
      technician: techId
    })
      .populate('customer', 'name email phone')
      .sort({ date: 1 });

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Technician accepts a booking
exports.acceptBooking = async (req, res) => {
  try {
    const techId = req.user.id;
    const booking = await Booking.findById(req.params.id).populate('customer', 'name email phone');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Only allow accepting if booking is Scheduled (assigned by admin)
    if (booking.status !== 'Scheduled') {
      return res.status(400).json({ message: 'Booking must be in Scheduled status to accept' });
    }

    if (!booking.technician || booking.technician.toString() !== techId) {
      return res.status(403).json({ message: 'You are not assigned to this booking' });
    }

    booking.status = 'Accepted';
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('customer', 'name email phone')
      .populate('technician', 'name specialty phone');

    res.json({ message: 'Booking accepted', booking: populatedBooking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Technician cancels a booking
exports.cancelBooking = async (req, res) => {
  try {
    const techId = req.user.id;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (!booking.technician || booking.technician.toString() !== techId) {
      return res.status(403).json({ message: 'You are not assigned to this booking' });
    }

    // Can only cancel if booking is Scheduled or Accepted (before work starts)
    if (!['Scheduled', 'Accepted'].includes(booking.status)) {
      return res.status(400).json({ message: `Cannot cancel booking with status: ${booking.status}` });
    }

    // Remove technician assignment and set back to Pending
    booking.technician = null;
    booking.status = 'Pending';
    await booking.save();

    res.json({ message: 'Booking cancelled and returned to pending', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Generate start OTP (after reaching customer location)
exports.generateStartOtp = async (req, res) => {
  try {
    const techId = req.user.id;
    const booking = await Booking.findById(req.params.id).populate('customer', 'email phone name');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (!booking.technician || booking.technician.toString() !== techId) {
      return res.status(403).json({ message: 'You are not assigned to this booking' });
    }

    // Can only generate start OTP if status is Accepted
    if (booking.status !== 'Accepted') {
      return res.status(400).json({ message: 'Can only generate start OTP after accepting booking' });
    }

    const customerEmail = booking.customer?.email;
    if (!customerEmail) return res.status(400).json({ message: 'Customer has no email to send OTP' });

    // Delete existing start OTPs for this booking
    await OTP.deleteMany({ booking: booking._id, type: 'start' });

    const otp = generateOtp();
    await OTP.create({ email: customerEmail, otp, booking: booking._id, type: 'start' });

    // Send OTP notification to customer
    try {
      const io = req.app.get('io');
      await sendOTPNotification(io, booking.customer._id, otp, booking._id, 'start');
    } catch (err) {
      console.error('Failed to send start OTP notification:', err.message || err);
    }

    res.json({ message: 'Start OTP sent to customer', otp: process.env.NODE_ENV === 'development' ? otp : undefined });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify start OTP
exports.verifyStartOtp = async (req, res) => {
  try {
    const techId = req.user.id;
    const { otp } = req.body;
    const booking = await Booking.findById(req.params.id).populate('customer', 'email phone name');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (!booking.technician || booking.technician.toString() !== techId) {
      return res.status(403).json({ message: 'You are not assigned to this booking' });
    }

    const otpRecord = await OTP.findOne({ booking: booking._id, otp, type: 'start' });
    if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });

    // Delete start OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    // Update booking to In Progress
    booking.status = 'In Progress';
    await booking.save();

    res.json({ message: 'OTP verified. Booking marked In Progress.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate completion OTP (when service is finished)
exports.generateCompleteOtp = async (req, res) => {
  try {
    const techId = req.user.id;
    const booking = await Booking.findById(req.params.id).populate('customer', 'email phone name');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (!booking.technician || booking.technician.toString() !== techId) {
      return res.status(403).json({ message: 'You are not assigned to this booking' });
    }

    // Can only generate completion OTP if status is In Progress
    if (booking.status !== 'In Progress') {
      return res.status(400).json({ message: 'Can only generate completion OTP when service is in progress' });
    }

    const customerEmail = booking.customer?.email;
    if (!customerEmail) return res.status(400).json({ message: 'Customer has no email to send OTP' });

    // Delete existing completion OTPs for this booking
    await OTP.deleteMany({ booking: booking._id, type: 'complete' });

    const otp = generateOtp();
    await OTP.create({ email: customerEmail, otp, booking: booking._id, type: 'complete' });

    // Send completion OTP notification to customer
    try {
      const io = req.app.get('io');
      await sendOTPNotification(io, booking.customer._id, otp, booking._id, 'complete');
    } catch (err) {
      console.error('Failed to send completion OTP notification:', err.message || err);
    }

    res.json({ message: 'Completion OTP sent to customer', otp: process.env.NODE_ENV === 'development' ? otp : undefined });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify completion OTP and mark booking completed
exports.verifyCompleteOtp = async (req, res) => {
  try {
    const techId = req.user.id;
    const { otp } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (!booking.technician || booking.technician.toString() !== techId) {
      return res.status(403).json({ message: 'You are not assigned to this booking' });
    }

    const otpRecord = await OTP.findOne({ booking: booking._id, otp, type: 'complete' });
    if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });

    // Delete completion OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    booking.status = 'Completed';
    await booking.save();

    res.json({ message: 'Booking marked as Completed', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
