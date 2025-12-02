const Booking = require('../models/Booking');
const Technician = require('../models/Technician');
const OTP = require('../models/OTP');
const User = require('../models/User');
const { sendOTP } = require('../utils/emailService');

// Helper to generate 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.getProfile = async (req, res) => {
  try {
    const tech = await Technician.findById(req.user.id).select('-password');
    if (!tech) return res.status(404).json({ message: 'Technician not found' });
    res.json({ technician: tech });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Returns bookings assigned to technician and public pending bookings
exports.getBookings = async (req, res) => {
  try {
    const techId = req.user.id;

    const bookings = await Booking.find({
      $or: [
        { technician: techId },
        { technician: { $exists: false } },
        { technician: null, status: 'Pending' }
      ]
    })
      .populate('customer', 'name email phone')
      .sort({ date: 1 });

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Technician accepts a booking (assigns themselves)
exports.acceptBooking = async (req, res) => {
  try {
    const techId = req.user.id;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.technician && booking.technician.toString() !== techId) {
      return res.status(403).json({ message: 'Booking already assigned to another technician' });
    }

    booking.technician = techId;
    booking.status = 'Scheduled';
    await booking.save();

    res.json({ message: 'Booking accepted', booking });
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

    booking.status = 'Cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update booking status (maps external status to internal)
exports.updateBookingStatus = async (req, res) => {
  try {
    const techId = req.user.id;
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (!booking.technician || booking.technician.toString() !== techId) {
      return res.status(403).json({ message: 'You are not assigned to this booking' });
    }

    const map = {
      assigned: 'Scheduled',
      on_the_way: 'Scheduled',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };

    if (!status || !map[status]) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    booking.status = map[status];
    await booking.save();

    res.json({ message: 'Status updated', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate start OTP (admin would normally send OTP, but technician triggers generation)
exports.generateStartOtp = async (req, res) => {
  try {
    const techId = req.user.id;
    const booking = await Booking.findById(req.params.id).populate('customer', 'email phone name');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (!booking.technician || booking.technician.toString() !== techId) {
      return res.status(403).json({ message: 'You are not assigned to this booking' });
    }

    const customerEmail = booking.customer?.email;
    if (!customerEmail) return res.status(400).json({ message: 'Customer has no email to send OTP' });

    // Delete existing start OTPs for this booking
    await OTP.deleteMany({ booking: booking._id, type: 'start' });

    const otp = generateOtp();
    await OTP.create({ email: customerEmail, otp, booking: booking._id, type: 'start' });

    // Send OTP via email (async)
    try {
      await sendOTP(customerEmail, otp);
    } catch (err) {
      console.error('Failed to send start OTP:', err.message || err);
    }

    res.json({ message: 'Start OTP generated and sent to customer (if email available)' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify start OTP and generate completion OTP
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

    // Generate completion OTP and send to customer
    const completionOtp = generateOtp();
    await OTP.deleteMany({ booking: booking._id, type: 'complete' });
    await OTP.create({ email: booking.customer.email, otp: completionOtp, booking: booking._id, type: 'complete' });
    try {
      await sendOTP(booking.customer.email, completionOtp);
    } catch (err) {
      console.error('Failed to send completion OTP:', err.message || err);
    }

    res.json({ message: 'OTP verified. Booking marked In Progress and completion OTP sent to customer.' });
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
