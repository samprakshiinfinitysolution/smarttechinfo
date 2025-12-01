const mongoose = require('mongoose');

const technicianSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  phone: { 
    type: String, 
    required: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number']
  },
  password: { type: String, required: true },
  specialty: { type: String, required: true },
  rating: { type: Number, default: 0 },
  services: { type: Number, default: 0 },
  status: { type: String, enum: ['Available', 'Busy', 'Offline'], default: 'Available' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Technician', technicianSchema);
