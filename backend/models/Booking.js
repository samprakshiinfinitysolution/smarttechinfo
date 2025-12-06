const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: String, required: true },
  technician: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician' },
  date: { type: String, required: true },
  time: { type: String, required: true },
  amount: { type: Number, required: true },
  issue: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  status: { 
    type: String, 
    enum: ['Pending', 'Scheduled', 'Accepted', 'In Progress', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  },
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
