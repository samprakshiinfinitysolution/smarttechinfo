const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Notification = require('../models/Notification');

dotenv.config();

const clearOldNotifications = async () => {
  try {
    await mongoose.connect(process.env.MONGODB);
    console.log('Connected to MongoDB');

    // Delete all old notifications with the old message format
    const result = await Notification.deleteMany({
      message: { $regex: /Your service verification OTP is:/ }
    });

    console.log(`Deleted ${result.deletedCount} old notifications`);
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error clearing old notifications:', error);
    process.exit(1);
  }
};

clearOldNotifications();