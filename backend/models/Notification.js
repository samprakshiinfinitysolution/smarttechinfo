const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['otp', 'booking_update', 'general'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: Object }, // Additional data like OTP, booking ID, etc.
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);