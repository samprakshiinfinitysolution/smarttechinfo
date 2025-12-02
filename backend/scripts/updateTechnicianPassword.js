#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Technician = require('../models/Technician');

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node updateTechnicianPassword.js <email> <newPassword> [phone]');
    process.exit(1);
  }

  const [email, newPassword, phone] = args;

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB;
  if (!uri) {
    console.error('MongoDB URI not set in env (MONGODB_URI / MONGO_URI / MONGODB)');
    process.exit(1);
  }

  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    const tech = await Technician.findOne({ email });
    if (!tech) {
      console.error('Technician not found with email:', email);
      process.exit(2);
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    tech.password = hashed;
    if (phone) tech.phone = phone;
    await tech.save();
    console.log('Technician updated:', tech.email);
    process.exit(0);
  } catch (err) {
    console.error('Error updating technician:', err.message || err);
    process.exit(1);
  }
}

main();
