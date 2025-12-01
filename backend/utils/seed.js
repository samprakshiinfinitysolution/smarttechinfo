const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Technician = require('../models/Technician');
const Booking = require('../models/Booking');
const Service = require('../models/Service');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Admin.deleteMany({});
    await User.deleteMany({});
    await Technician.deleteMany({});
    await Booking.deleteMany({});
    await Service.deleteMany({});

    // Create Admin
    const hashedAdminPass = await bcrypt.hash('123', 10);
    const admin = await Admin.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: hashedAdminPass
    });
    console.log('Admin created');

    // Create Users
    const hashedUserPass = await bcrypt.hash('password123', 10);
    const users = await User.insertMany([
      { name: 'Priya Sharma', email: 'priya@example.com', phone: '+91000000000', password: hashedUserPass, bookings: 12 },
      { name: 'Rahul Verma', email: 'rahul@example.com', phone: '+91000000000', password: hashedUserPass, bookings: 8 },
      { name: 'Anjali Singh', email: 'anjali@example.com', phone: '+91000000000', password: hashedUserPass, bookings: 15 }
    ]);
    console.log('Users created');

    // Create Technicians
    const hashedTechPass = await bcrypt.hash('tech123', 10);
    const technicians = await Technician.insertMany([
      { name: 'Rajesh Mehta', email: 'rajesh@example.com', phone: '+91000000000', password: hashedTechPass, specialty: 'AC Repair', rating: 4.5, services: 112 },
      { name: 'Amit Patel', email: 'amit@example.com', phone: '+91000000000', password: hashedTechPass, specialty: 'Washing Machine', rating: 4.5, services: 80, status: 'Busy' },
      { name: 'Sahil Kumar', email: 'sahil@example.com', phone: '+91000000000', password: hashedTechPass, specialty: 'Refrigerator', rating: 4.5, services: 118 }
    ]);
    console.log('Technicians created');

    // Create Services
    const services = await Service.insertMany([
      { name: 'AC Repair & Service', description: 'Complete AC repair and maintenance service including gas refilling, cleaning, and general servicing', serviceCharges: 599, image: '/uploads/ac-service.jpg', category: 'Home Appliances', isActive: true },
      { name: 'Washing Machine Repair', description: 'Expert washing machine repair service for all brands. Includes drum cleaning, motor repair, and parts replacement', serviceCharges: 450, image: '/uploads/washing-machine.jpg', category: 'Home Appliances', isActive: true },
      { name: 'Refrigerator Repair', description: 'Professional refrigerator repair service covering cooling issues, compressor problems, and door seal replacement', serviceCharges: 750, image: '/uploads/refrigerator.jpg', category: 'Home Appliances', isActive: true },
      { name: 'TV Repair Service', description: 'LED/LCD TV repair service including screen replacement, sound issues, and smart TV troubleshooting', serviceCharges: 500, image: '/uploads/tv-repair.jpg', category: 'Electronics', isActive: true },
      { name: 'Microwave Repair', description: 'Complete microwave oven repair service for heating issues, turntable problems, and control panel repair', serviceCharges: 350, image: '/uploads/microwave.jpg', category: 'Kitchen Appliances', isActive: true },
      { name: 'Water Purifier Service', description: 'RO water purifier service including filter replacement, membrane cleaning, and TDS adjustment', serviceCharges: 400, image: '/uploads/water-purifier.jpg', category: 'Home Appliances', isActive: true }
    ]);
    console.log('Services created');

    // Create Bookings
    await Booking.insertMany([
      { customer: users[0]._id, service: 'AC Repair', technician: technicians[0]._id, date: '2025-11-08', time: '10:00 AM', amount: 599, status: 'Completed' },
      { customer: users[1]._id, service: 'Washing Machine', technician: technicians[1]._id, date: '2025-11-09', time: '02:00 PM', amount: 450, status: 'In Progress' },
      { customer: users[2]._id, service: 'Refrigerator', technician: technicians[2]._id, date: '2025-11-10', time: '11:30 AM', amount: 750, status: 'Scheduled' }
    ]);
    console.log('Bookings created');

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
