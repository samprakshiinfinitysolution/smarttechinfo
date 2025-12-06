const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Rating = require('../models/Rating');

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rate a completed booking
router.post('/bookings/:id/rate', authMiddleware, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const bookingId = req.params.id;
    const customerId = req.user.id;

    // Find booking and verify it belongs to customer and is completed
    const booking = await Booking.findOne({ 
      _id: bookingId, 
      customer: customerId, 
      status: 'Completed' 
    }).populate('technician');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or not completed' });
    }

    if (booking.rating) {
      return res.status(400).json({ message: 'Booking already rated' });
    }

    // Update booking with rating
    booking.rating = rating;
    booking.review = review || '';
    await booking.save();

    // Create rating record
    await Rating.create({
      booking: bookingId,
      customer: customerId,
      technician: booking.technician._id,
      rating,
      review: review || '',
      service: booking.service
    });

    res.json({ message: 'Rating submitted successfully', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
