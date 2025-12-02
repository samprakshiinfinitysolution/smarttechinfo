const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const techCtrl = require('../controllers/technicianController');

// Technician profile
router.get('/profile', authMiddleware, techCtrl.getProfile);

// Bookings visible to technician (assigned + pending)
router.get('/bookings', authMiddleware, techCtrl.getBookings);

// Accept a booking (assign to self)
router.put('/bookings/accept/:id', authMiddleware, techCtrl.acceptBooking);

// Cancel a booking (by assigned technician)
router.put('/bookings/cancel/:id', authMiddleware, techCtrl.cancelBooking);

// Update booking status (assigned, on_the_way, in_progress, completed, cancelled)
router.put('/bookings/status/:id', authMiddleware, techCtrl.updateBookingStatus);

// OTP flows: generate start OTP (admin normally), verify start OTP -> moves to In Progress and sends completion OTP
router.post('/bookings/generate-start-otp/:id', authMiddleware, techCtrl.generateStartOtp);
router.post('/bookings/verify-start-otp/:id', authMiddleware, techCtrl.verifyStartOtp);
router.post('/bookings/verify-complete-otp/:id', authMiddleware, techCtrl.verifyCompleteOtp);

module.exports = router;
