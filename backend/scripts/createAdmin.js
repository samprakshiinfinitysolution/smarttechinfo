// One-off script to create an admin user in the database.
// Usage (from backend folder):
//   node scripts/createAdmin.js "Admin Name" "admin@example.com" "mypassword"

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

// Usage:
// node scripts/createAdmin.js "Full Name" "email@domain" "password" [dbName]
// or set MONGO_URI in .env

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.log('Usage: node scripts/createAdmin.js "Full Name" "email@domain" "password" [dbName]');
    process.exit(1);
  }

  const [name, email, password, dbNameArg] = args;

  const mongoFromEnv = process.env.MONGO_URI || '';
  // If MONGO_URI includes a database, use it. Otherwise if dbNameArg provided, append it.
  let MONGO = '';
  if (mongoFromEnv) {
    MONGO = mongoFromEnv;
  } else if (dbNameArg) {
    MONGO = `mongodb://127.0.0.1:27017/${dbNameArg}`;
  } else {
    // default to local 'smarttech' (legacy)
    MONGO = 'mongodb://127.0.0.1:27017/smarttech';
  }

  try {
    const conn = await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB at', MONGO);

    // Show collections for debugging
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections in DB:', collections.map(c => c.name).join(', '));

    // If the project already has a collection named 'adminusers', insert there; otherwise use Admin model
    const targetCollection = collections.find(c => c.name === 'adminusers') ? 'adminusers' : null;

    // Check for existing admin by email in either target collection or Admin model
    if (targetCollection) {
      const existing = await db.collection(targetCollection).findOne({ email });
      if (existing) {
        console.log('Admin with that email already exists in collection', targetCollection, email);
        process.exit(0);
      }
    } else {
      const existing = await Admin.findOne({ email });
      if (existing) {
        console.log('Admin with that email already exists:', email);
        process.exit(0);
      }
    }

    const hash = await bcrypt.hash(password, 10);

    if (targetCollection) {
      const result = await db.collection(targetCollection).insertOne({ name, email, password: hash, role: 'admin', createdAt: new Date() });
      console.log('Admin created in collection', targetCollection, { id: result.insertedId.toString(), email });
    } else {
      const admin = new Admin({ name, email, password: hash });
      await admin.save();
      console.log('Admin created (admins collection):', { id: admin._id.toString(), email: admin.email });
    }

    process.exit(0);
  } catch (err) {
    console.error('Failed to create admin:', err);
    process.exit(1);
  }
}

main();
