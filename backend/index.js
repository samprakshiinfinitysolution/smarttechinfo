const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
// Production-ready CORS: allow requests from configured FRONTEND_URL
// Default frontend for local development is now http://localhost:5004
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5004';
app.set('trust proxy', 1); // trust first proxy when behind nginx or other proxies

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (curl, Postman)
    if (!origin) return callback(null, true);
    if (origin === FRONTEND_URL) return callback(null, true);
    // allow localhost during development
    if (origin.startsWith('http://localhost')) return callback(null, true);
    return callback(new Error('CORS policy: This origin is not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/otp', require('./routes/otpRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/technicians', require('./routes/technicianRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Root route for basic confirmation
app.get('/', (req, res) => {
  res.send('✅ SmartTechInfo Run successfully');
});

// Default backend port for local development is now 5003
const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




