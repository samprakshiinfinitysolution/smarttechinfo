const express = require('express');
const router = express.Router();
const { authMiddleware, adminAuth } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllBookings,
  getAllUsers,
  getUserById,
  getAllTechnicians,
  updateBookingStatus,
  updateBooking,
  deleteBooking,
  updateUserStatus,
  updateUser,
  deleteUser,
  createTechnician,
  updateTechnician,
  deleteTechnician,
  exportBookings,
  exportUsers,
  exportTechnicians,
  createUser,
  createBooking,
  getAnalytics
} = require('../controllers/adminController');

router.use(authMiddleware, adminAuth);

router.get('/stats', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/bookings', getAllBookings);
router.post('/bookings', createBooking);
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.get('/users/:id', getUserById);
router.get('/technicians', getAllTechnicians);
router.post('/technicians', createTechnician);
router.get('/technicians/:id/bookings', async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const bookings = await Booking.find({ technician: req.params.id })
      .populate('customer', 'name email phone')
      .sort({ date: -1 });
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Get single technician profile with computed stats (for admin view)
router.get('/technicians/:id/profile', async (req, res) => {
  try {
    const Technician = require('../models/Technician');
    const Booking = require('../models/Booking');
    const mongoose = require('mongoose');
    const techId = req.params.id;

    const tech = await Technician.findById(techId).select('-password');
    if (!tech) return res.status(404).json({ message: 'Technician not found' });

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

    const technician = tech.toObject();
    technician.totalJobs = totalJobs;
    technician.completedJobs = completedJobs;
    technician.pendingJobs = pendingJobs;
    technician.todayJobs = todayJobs;
    technician.avgRating = avgRating;

    res.json({ technician });
  } catch (error) {
    console.error('Admin get technician profile error:', error);
    res.status(500).json({ message: error.message });
  }
});
router.patch('/technicians/:id', updateTechnician);
router.delete('/technicians/:id', deleteTechnician);
router.put('/bookings/:id', updateBooking);
router.patch('/bookings/:id/status', updateBookingStatus);
router.delete('/bookings/:id', deleteBooking);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/export/bookings', exportBookings);
router.get('/export/users', exportUsers);
router.get('/export/technicians', exportTechnicians);

// Get all ratings
router.get('/ratings', async (req, res) => {
  try {
    const Rating = require('../models/Rating');
    const Booking = require('../models/Booking');
    
    // Also get ratings from bookings table
    const bookingsWithRatings = await Booking.find({ rating: { $exists: true, $ne: null } })
      .populate('customer', 'name email')
      .populate('technician', 'name specialty')
      .sort({ createdAt: -1 });
    
    const ratings = await Rating.find()
      .populate('customer', 'name email')
      .populate('technician', 'name specialty')
      .populate('booking', 'service date amount')
      .sort({ createdAt: -1 });
    
    console.log('Ratings from Rating model:', ratings.length);
    console.log('Bookings with ratings:', bookingsWithRatings.length);
    
    // Combine both sources
    const allRatings = [
      ...ratings,
      ...bookingsWithRatings.map(booking => ({
        _id: booking._id,
        rating: booking.rating,
        review: booking.review || '',
        service: booking.service,
        createdAt: booking.createdAt,
        customer: booking.customer,
        technician: booking.technician,
        booking: booking
      }))
    ];
    
    res.json({ ratings: allRatings });
  } catch (error) {
    console.error('Admin ratings error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Admin notifications
router.get('/notifications', async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ notifications });
  } catch (error) {
    console.error('Admin notifications error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
