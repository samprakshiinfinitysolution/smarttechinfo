# Backend Setup & Testing Guide

## 🚀 Quick Start

### 1. Start MongoDB
```bash
net start MongoDB
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Seed Database with Sample Data
```bash
node utils/seed.js
```

### 4. Start Backend Server
```bash
npm run dev
```
Backend will run on: http://localhost:5000

### 5. Start Frontend (New Terminal)
```bash
cd ..
npm install
npm run dev
```
Frontend will run on: http://localhost:3000

## 🔑 Test Credentials

### User Login
- Email: `priya@example.com`
- Password: `password123`

### Admin Login (Admin Dashboard)
- Email: `admin@example.com`
- Password: `123`

## ✅ Features Connected

### User Dashboard
- ✅ Real-time booking data from MongoDB
- ✅ Active bookings display
- ✅ Completed bookings history
- ✅ Stats (Total, Active, Completed, Total Spent)
- ✅ Logout functionality

### Authentication
- ✅ User login with JWT
- ✅ User registration
- ✅ Token-based authentication
- ✅ Auto-redirect on login/logout

### API Endpoints Used
- `POST /api/auth/login` - User login
- `POST /api/auth/user/register` - User registration
- `GET /api/bookings/my-bookings` - Get user bookings

## 🧪 Test the Integration

1. **Register New User**
   - Click "Login" in navbar
   - Click "Create An Account"
   - Fill form and submit
   - Should redirect to dashboard

2. **Login Existing User**
   - Use test credentials above
   - Should see real bookings from database

3. **View Bookings**
   - Dashboard shows active bookings
   - Switch to "Booking History" tab
   - See completed bookings

4. **Logout**
   - Click "Log Out" button
   - Confirm in modal
   - Should redirect to home
   - Navbar should show "Login" again

## 📊 Database Collections

After seeding, you'll have:
- **3 Users** (including Priya)
- **3 Technicians**
- **3 Bookings** (various statuses)
- **1 Admin**

## 🔧 Troubleshooting

**Backend not starting?**
- Check MongoDB is running: `net start MongoDB`
- Check port 5000 is free

**No bookings showing?**
- Run seed script: `node utils/seed.js`
- Check backend console for errors

**Login not working?**
- Verify backend is running on port 5000
- Check browser console for errors
- Ensure credentials are correct
