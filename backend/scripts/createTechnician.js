#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Technician = require('../models/Technician');

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error('Usage: node createTechnician.js <name> <email> <password> [specialty]');
    process.exit(1);
  }

  const [name, email, password, specialty = 'General'] = args;

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB;
  if (!uri) {
    console.error('MongoDB URI not set in env (MONGODB_URI / MONGO_URI / MONGODB)');
    process.exit(1);
  }

  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    const existing = await Technician.findOne({ email });
    if (existing) {
      console.log('Technician already exists:', existing.email);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(password, 10);
    const tech = new Technician({ name, email, password: hashed, specialty });
    await tech.save();
    console.log('Technician created:', tech.email);
    process.exit(0);
  } catch (err) {
    console.error('Error creating technician:', err.message || err);
    process.exit(1);
  }
}

main();
