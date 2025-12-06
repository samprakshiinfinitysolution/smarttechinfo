const Notification = require('../models/Notification');

const sendNotification = async (io, userId, notificationData) => {
  try {
    // Save notification to database
    const notification = new Notification({
      user: userId,
      ...notificationData
    });
    await notification.save();

    // Send real-time notification via Socket.IO
    io.to(`user_${userId}`).emit('notification', notification);
    
    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

const sendOTPNotification = async (io, userId, otp, bookingId, otpType = 'start') => {
  const isStart = otpType === 'start';
  return sendNotification(io, userId, {
    type: 'otp',
    title: isStart ? 'Start Service OTP' : 'Complete Service OTP',
    message: isStart 
      ? `Your technician has arrived! Use this OTP to start the service: ${otp}`
      : `Service completed! Use this OTP to confirm completion: ${otp}`,
    data: { otp, bookingId, otpType }
  });
};

const sendBookingUpdateNotification = async (io, userId, message, bookingId) => {
  return sendNotification(io, userId, {
    type: 'booking_update',
    title: 'Booking Update',
    message,
    data: { bookingId }
  });
};

module.exports = {
  sendNotification,
  sendOTPNotification,
  sendBookingUpdateNotification
};