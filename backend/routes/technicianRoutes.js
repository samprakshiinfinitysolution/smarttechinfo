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

// OTP flows: generate start OTP, verify start OTP, generate completion OTP, verify completion OTP
router.post('/bookings/generate-start-otp/:id', authMiddleware, techCtrl.generateStartOtp);
router.post('/bookings/verify-start-otp/:id', authMiddleware, techCtrl.verifyStartOtp);
router.post('/bookings/generate-complete-otp/:id', authMiddleware, techCtrl.generateCompleteOtp);
router.post('/bookings/verify-complete-otp/:id', authMiddleware, techCtrl.verifyCompleteOtp);

module.exports = router;
