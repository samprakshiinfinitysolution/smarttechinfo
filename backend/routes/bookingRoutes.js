const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Admin = require('../models/Admin');
const { sendBookingUpdateNotification } = require('../utils/notificationService');

router.post('/', authMiddleware, async (req, res) => {
  try {
    const booking = new Booking({ ...req.body, customer: req.user.id });
    await booking.save();
    // Notify all admins about new booking
    try {
      const io = req.app.get('io');
      const user = await require('../models/User').findById(req.user.id).select('name email');
      const admins = await Admin.find();
      const message = `${user?.name || 'A user'} requested ${booking.service}`;
      for (const admin of admins) {
        // sendBookingUpdateNotification(io, admin._id, message, booking._id);
        // Use sendBookingUpdateNotification to persist + emit
        await sendBookingUpdateNotification(io, admin._id, message, booking._id);
      }
    } catch (err) {
      console.error('Failed to send admin notifications for new booking', err);
    }
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/my-bookings', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id })
      .populate('technician', 'name specialty')
      .sort({ createdAt: -1 });
    
    // Add phone only for Accepted, In Progress, or Completed bookings
    const populatedBookings = await Promise.all(bookings.map(async (booking) => {
      const bookingObj = booking.toObject();
      if (booking.technician && ['Accepted', 'In Progress', 'Completed'].includes(booking.status)) {
        const tech = await require('../models/Technician').findById(booking.technician._id).select('phone');
        if (tech) bookingObj.technician.phone = tech.phone;
      }
      return bookingObj;
    }));
    
    res.json(populatedBookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, customer: req.user.id },
      req.body,
      { new: true }
    ).populate('technician', 'name specialty phone');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
