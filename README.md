# 🚀 Smart Info Tech - Complete Full Stack Application

A comprehensive service management platform with admin dashboard, technician portal, and customer interface.

## 📋 Project Overview

This is a full-stack application built with:
- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express.js + MongoDB + JWT Authentication
- **Features**: Admin Dashboard, Booking Management, User Management, Technician Management

## 🎯 Quick Start

### Option 1: Quick Start (Windows)
```bash
# Double-click this file:
start-dev.bat
```

### Option 2: Manual Start

**1. Start MongoDB**
```bash
net start MongoDB
```

**2. Install & Start Backend**
```bash
cd backend
npm install
node utils/seed.js  # Seed database
npm run dev         # Start backend on port 5000
```

**3. Install & Start Frontend**
```bash
# In new terminal, from project root
npm install
npm run dev  # Start frontend on port 3000
```

## 🌐 Access Points

- **Home Page**: http://localhost:3000
- **Admin Login**: http://localhost:3000/admin-login
- **Admin Dashboard**: http://localhost:3000/admin/dashboard
- **Backend API**: http://localhost:5000/api

## 🔑 Default Credentials

**Admin Login**
- Email: `admin@example.com`
- Password: `123`

## 📁 Project Structure

```
SmartTechInfo/
├── backend/              # Express.js API
│   ├── config/          # Database config
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   └── utils/           # Utilities & seed
│
├── src/
│   ├── app/
│   │   ├── admin/       # Admin dashboard pages
│   │   ├── admin-login/ # Admin login
│   │   └── page.tsx     # Home page
│   ├── components/      # React components
│   └── lib/             # API utilities
│
└── public/              # Static assets
```

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture & diagrams
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete project overview
- **[STRUCTURE_VISUAL.md](STRUCTURE_VISUAL.md)** - Visual structure guide
- **[CHECKLIST.md](CHECKLIST.md)** - Setup & testing checklist

## ✨ Features

### Admin Dashboard
- ✅ Real-time statistics
- ✅ Booking management with filters
- ✅ User management
- ✅ Technician management
- ✅ Analytics & reports
- ✅ Search & filter functionality
- ✅ Responsive design

### Backend API
- ✅ RESTful API
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ MongoDB integration
- ✅ Password hashing
- ✅ CORS enabled

## 🛠️ Tech Stack

**Frontend**
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

## 📡 API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/technician/login` - Technician login
- `POST /api/auth/user/register` - User registration

### Admin (Protected)
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/bookings` - All bookings
- `GET /api/admin/users` - All users
- `GET /api/admin/technicians` - All technicians
- `PATCH /api/admin/bookings/:id` - Update booking

## 🧪 Testing

1. **Backend Health Check**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Admin Login**
   ```bash
   curl -X POST http://localhost:5000/api/auth/admin/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"123"}'
   ```

## 🚀 Deployment

**Frontend**: Deploy to Vercel
```bash
npm run build
```

**Backend**: Deploy to AWS/Heroku/DigitalOcean

**Database**: Use MongoDB Atlas for production

## 📞 Support

For detailed information, check the documentation files listed above.

## 📄 License

This project is for educational and commercial use.

---

**Built with ❤️ using Next.js, Express.js, and MongoDB**
