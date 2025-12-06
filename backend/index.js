const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Make io available globally
app.set('io', io);

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
app.use('/auth', require('./routes/authRoutes'));
app.use('/otp', require('./routes/otpRoutes'));
app.use('/admin', require('./routes/adminRoutes'));
app.use('/bookings', require('./routes/bookingRoutes'));
app.use('/technicians', require('./routes/technicianRoutes'));
app.use('/users', require('./routes/userRoutes'));
app.use('/services', require('./routes/serviceRoutes'));
app.use('/notifications', require('./routes/notificationRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Also expose health at /health to support proxies that strip the /api prefix
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Root route for basic confirmation
app.get('/', (req, res) => {
  res.send('✅ SmartTechInfo Run successfully');
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Default backend port for local development is now 5003
const PORT = process.env.PORT || 5004;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




