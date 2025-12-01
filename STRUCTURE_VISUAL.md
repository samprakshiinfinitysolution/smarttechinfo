# 📊 Smart Info Tech - Visual Project Structure

## 🎨 Complete Project Tree

```
SmartTechInfo/
│
├── 📁 backend/                          # Backend API Server
│   ├── 📁 config/
│   │   └── db.js                        # MongoDB connection setup
│   │
│   ├── 📁 controllers/
│   │   ├── authController.js            # Login/Register handlers
│   │   └── adminController.js           # Admin CRUD operations
│   │
│   ├── 📁 middleware/
│   │   └── auth.js                      # JWT verification & role check
│   │
│   ├── 📁 models/
│   │   ├── Admin.js                     # Admin schema
│   │   ├── User.js                      # User schema
│   │   ├── Technician.js                # Technician schema
│   │   └── Booking.js                   # Booking schema
│   │
│   ├── 📁 routes/
│   │   ├── authRoutes.js                # /api/auth/*
│   │   ├── adminRoutes.js               # /api/admin/*
│   │   ├── bookingRoutes.js             # /api/bookings/*
│   │   ├── technicianRoutes.js          # /api/technicians/*
│   │   └── userRoutes.js                # /api/users/*
│   │
│   ├── 📁 utils/
│   │   └── seed.js                      # Database seeding script
│   │
│   ├── 📁 uploads/                      # File uploads directory
│   │   └── .gitkeep
│   │
│   ├── .env                             # Backend environment variables
│   ├── .gitignore
│   ├── index.js                         # Server entry point
│   └── package.json                     # Backend dependencies
│
├── 📁 src/                              # Frontend Next.js App
│   ├── 📁 app/
│   │   │
│   │   ├── 📁 admin/                    # Admin Dashboard
│   │   │   ├── 📁 dashboard/
│   │   │   │   └── page.tsx             # Main dashboard with stats
│   │   │   │
│   │   │   ├── 📁 bookings/
│   │   │   │   └── page.tsx             # Bookings management
│   │   │   │
│   │   │   ├── 📁 users/
│   │   │   │   └── page.tsx             # Users management
│   │   │   │
│   │   │   ├── 📁 technicians/
│   │   │   │   └── page.tsx             # Technicians management
│   │   │   │
│   │   │   ├── 📁 analytics/
│   │   │   │   └── page.tsx             # Analytics & reports
│   │   │   │
│   │   │   ├── layout.tsx               # Admin layout with sidebar
│   │   │   └── page.tsx                 # Admin home redirect
│   │   │
│   │   ├── 📁 admin-login/
│   │   │   └── page.tsx                 # Admin login page
│   │   │
│   │   ├── page.tsx                     # Home/Landing page
│   │   ├── layout.tsx                   # Root layout
│   │   ├── globals.css                  # Global styles
│   │   └── favicon.ico
│   │
│   ├── 📁 components/
│   │   └── 📁 admin/                    # Reusable admin components
│   │
│   ├── 📁 lib/
│   │   └── api.ts                       # API utility functions
│   │
│   └── 📁 assets/
│       └── logo.jpeg
│
├── 📁 public/                           # Static assets
│   ├── hero.png
│   ├── LOGO1.png
│   ├── reliableServices.png
│   └── ...
│
├── 📄 .env.local                        # Frontend environment variables
├── 📄 .gitignore
├── 📄 package.json                      # Frontend dependencies
├── 📄 tsconfig.json                     # TypeScript config
├── 📄 next.config.ts                    # Next.js config
├── 📄 tailwind.config.js                # Tailwind CSS config
├── 📄 postcss.config.mjs
│
├── 📄 SETUP.md                          # Setup instructions
├── 📄 ARCHITECTURE.md                   # System architecture
├── 📄 PROJECT_SUMMARY.md                # Project overview
├── 📄 STRUCTURE_VISUAL.md               # This file
├── 📄 README.md                         # Next.js default readme
└── 📄 start-dev.bat                     # Quick start script
```

---

## 🔄 Request Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                             │
└─────────────────────────────────────────────────────────────────┘

1️⃣ ADMIN LOGIN
   Browser → /admin-login → Enter credentials → POST /api/auth/admin/login
   → Backend validates → JWT token returned → Store token → Redirect to dashboard

2️⃣ VIEW DASHBOARD
   Browser → /admin/dashboard → GET /api/admin/stats (with JWT)
   → Backend verifies token → Fetch from MongoDB → Return data → Display stats

3️⃣ MANAGE BOOKINGS
   Browser → /admin/bookings → GET /api/admin/bookings (with JWT)
   → Backend fetches all bookings → Populate customer & technician data
   → Return to frontend → Display in table → Apply filters (client-side)

4️⃣ UPDATE BOOKING
   Admin clicks status → PATCH /api/admin/bookings/:id (with JWT)
   → Backend updates MongoDB → Return updated booking → Refresh UI
```

---

## 🗂️ File Relationships

```
┌──────────────────────────────────────────────────────────────┐
│                    BACKEND STRUCTURE                          │
└──────────────────────────────────────────────────────────────┘

index.js
  ├─→ config/db.js (MongoDB connection)
  ├─→ routes/authRoutes.js
  │     └─→ controllers/authController.js
  │           └─→ models/Admin.js, User.js, Technician.js
  │
  ├─→ routes/adminRoutes.js
  │     ├─→ middleware/auth.js (JWT verification)
  │     └─→ controllers/adminController.js
  │           └─→ models/Booking.js, User.js, Technician.js
  │
  ├─→ routes/bookingRoutes.js
  │     ├─→ middleware/auth.js
  │     └─→ models/Booking.js
  │
  ├─→ routes/technicianRoutes.js
  │     ├─→ middleware/auth.js
  │     └─→ models/Booking.js
  │
  └─→ routes/userRoutes.js
        ├─→ middleware/auth.js
        └─→ models/User.js

┌──────────────────────────────────────────────────────────────┐
│                   FRONTEND STRUCTURE                          │
└──────────────────────────────────────────────────────────────┘

app/layout.tsx (Root)
  │
  ├─→ app/page.tsx (Home)
  │
  ├─→ app/admin-login/page.tsx
  │     └─→ lib/api.ts (adminLogin function)
  │
  └─→ app/admin/layout.tsx (Admin Layout with Sidebar)
        │
        ├─→ app/admin/dashboard/page.tsx
        │     └─→ lib/api.ts (getDashboardStats)
        │
        ├─→ app/admin/bookings/page.tsx
        │     └─→ lib/api.ts (getAllBookings, updateBookingStatus)
        │
        ├─→ app/admin/users/page.tsx
        │     └─→ lib/api.ts (getAllUsers)
        │
        ├─→ app/admin/technicians/page.tsx
        │     └─→ lib/api.ts (getAllTechnicians)
        │
        └─→ app/admin/analytics/page.tsx
```

---

## 🎯 Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                  ADMIN DASHBOARD LAYOUT                      │
└─────────────────────────────────────────────────────────────┘

app/admin/layout.tsx
├── Sidebar (Navigation)
│   ├── Logo
│   ├── Dashboard Link
│   ├── Bookings Link
│   ├── Users Link
│   ├── Technicians Link
│   ├── Analytics Link
│   └── Logout Button
│
└── Main Content Area
    └── {children} (Dynamic page content)
        │
        ├── Dashboard Page
        │   ├── Stats Cards (4)
        │   └── Recent Bookings Table
        │
        ├── Bookings Page
        │   ├── Stats Cards (4)
        │   ├── Search & Filter Bar
        │   └── Bookings Table
        │       └── Action Menu (per row)
        │
        ├── Users Page
        │   ├── Stats Cards (4)
        │   ├── Search & Filter Bar
        │   └── Users Table
        │       └── Action Menu (per row)
        │
        ├── Technicians Page
        │   ├── Stats Cards (4)
        │   ├── Search & Filter Bar
        │   └── Technicians Table
        │       └── Action Menu (per row)
        │
        └── Analytics Page
            └── Analytics Content
```

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  JWT AUTHENTICATION                          │
└─────────────────────────────────────────────────────────────┘

1. Login Request
   ┌──────────┐
   │  Client  │ → POST /api/auth/admin/login
   └──────────┘    { email, password }
        ↓
   ┌──────────────────┐
   │ authController   │ → Validate credentials
   └──────────────────┘ → Hash comparison
        ↓
   ┌──────────────────┐
   │   JWT Sign       │ → Generate token
   └──────────────────┘    { id, role }
        ↓
   ┌──────────────────┐
   │  Return Token    │ → { token, admin }
   └──────────────────┘
        ↓
   ┌──────────────────┐
   │ Client Storage   │ → localStorage/cookie
   └──────────────────┘

2. Protected Request
   ┌──────────┐
   │  Client  │ → GET /api/admin/stats
   └──────────┘    Header: Authorization: Bearer <token>
        ↓
   ┌──────────────────┐
   │  authMiddleware  │ → Verify token
   └──────────────────┘ → Decode payload
        ↓
   ┌──────────────────┐
   │   adminAuth      │ → Check role === 'admin'
   └──────────────────┘
        ↓
   ┌──────────────────┐
   │  Controller      │ → Process request
   └──────────────────┘ → Return data
```

---

## 📊 Database Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                  MONGODB COLLECTIONS                         │
└─────────────────────────────────────────────────────────────┘

┌──────────┐
│  admins  │
└──────────┘
  • _id
  • name
  • email
  • password (hashed)
  • role

┌──────────┐         ┌────────────┐         ┌──────────────┐
│  users   │◄────────│  bookings  │────────►│ technicians  │
└──────────┘         └────────────┘         └──────────────┘
  • _id                • _id                   • _id
  • name               • customer (ref)        • name
  • email              • service               • email
  • phone              • technician (ref)      • phone
  • password           • date                  • password
  • bookings           • time                  • specialty
  • status             • amount                • rating
  • joinedDate         • status                • services
                       • createdAt             • status

Relationships:
- bookings.customer → users._id (Many-to-One)
- bookings.technician → technicians._id (Many-to-One)
```

---

## 🚀 Startup Sequence

```
┌─────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT STARTUP                       │
└─────────────────────────────────────────────────────────────┘

Step 1: Start MongoDB
   └─→ net start MongoDB (Windows)
   └─→ MongoDB running on port 27017

Step 2: Start Backend
   └─→ cd backend
   └─→ npm run dev
   └─→ Express server on port 5000
   └─→ Connected to MongoDB
   └─→ Routes registered

Step 3: Start Frontend
   └─→ npm run dev
   └─→ Next.js on port 3000
   └─→ Pages compiled
   └─→ Ready for requests

Step 4: Access Application
   └─→ http://localhost:3000 (Home)
   └─→ http://localhost:3000/admin-login (Admin)
   └─→ http://localhost:5000/api/health (API)
```

---

## 📦 Dependencies Overview

### Backend Dependencies
```
express          → Web framework
mongoose         → MongoDB ODM
cors             → Cross-origin requests
dotenv           → Environment variables
bcryptjs         → Password hashing
jsonwebtoken     → JWT authentication
multer           → File uploads
express-validator → Input validation
nodemon          → Auto-restart (dev)
```

### Frontend Dependencies
```
next             → React framework
react            → UI library
react-dom        → React DOM
typescript       → Type safety
tailwindcss      → CSS framework
@types/*         → TypeScript types
eslint           → Code linting
```

---

## 🎉 Project Complete!

All components are integrated and ready to use:
✅ Backend API with authentication
✅ Frontend with admin dashboard
✅ Database models and relationships
✅ Seed data for testing
✅ Complete documentation
✅ Quick start scripts

**Ready for development and deployment!**
