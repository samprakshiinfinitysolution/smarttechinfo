const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Booking = require('../models/Booking');

router.get('/my-jobs', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ technician: req.user.id })
      .populate('customer', 'name phone')
      .sort({ date: 1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
