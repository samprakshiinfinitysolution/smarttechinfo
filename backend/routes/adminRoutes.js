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

module.exports = router;
