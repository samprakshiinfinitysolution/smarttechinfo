# Smart Info Tech - Full Stack Setup Guide

## 📁 Project Structure

```
SmartTechInfo/
├── backend/                    # Express.js Backend API
│   ├── config/                 # Database configuration
│   ├── controllers/            # Route controllers
│   ├── middleware/             # Auth & validation middleware
│   ├── models/                 # MongoDB models
│   ├── routes/                 # API routes
│   ├── utils/                  # Utilities & seed script
│   ├── uploads/                # File uploads
│   ├── .env                    # Backend environment variables
│   ├── index.js                # Server entry point
│   └── package.json
│
├── src/                        # Next.js Frontend
│   ├── app/                    # App router pages
│   │   ├── admin/              # Admin dashboard pages
│   │   │   ├── dashboard/
│   │   │   ├── bookings/
│   │   │   ├── users/
│   │   │   ├── technicians/
│   │   │   └── analytics/
│   │   ├── admin-login/        # Admin login page
│   │   └── page.tsx            # Home page
│   ├── components/             # React components
│   ├── lib/                    # API utilities
│   └── assets/                 # Images & static files
│
├── public/                     # Public assets
├── .env.local                  # Frontend environment variables
└── package.json                # Frontend dependencies
```

## 🚀 Setup Instructions

### 1. Install MongoDB
- Download and install MongoDB from https://www.mongodb.com/try/download/community
- Start MongoDB service:
  ```bash
  # Windows
  net start MongoDB
  
  # Mac/Linux
  sudo systemctl start mongod
  ```

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit backend/.env file with your settings

# Seed the database with initial data
node utils/seed.js

# Start backend server
npm run dev
```

Backend will run on: **http://localhost:5000**

### 3. Frontend Setup

```bash
# Navigate to project root
cd ..

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

Frontend will run on: **http://localhost:3000**

## 🔑 Default Login Credentials

### Admin Login
- **URL**: http://localhost:3000/admin-login
- **Email**: admin@example.com
- **Password**: 123

### Technician Login
- **Email**: rajesh@example.com
- **Password**: tech123

### User Login
- **Email**: priya@example.com
- **Password**: password123

## 📡 API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/technician/login` - Technician login
- `POST /api/auth/user/register` - User registration

### Admin Routes (Protected)
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/bookings` - All bookings
- `GET /api/admin/users` - All users
- `GET /api/admin/technicians` - All technicians
- `PATCH /api/admin/bookings/:id` - Update booking status

### Booking Routes
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - User's bookings

### Technician Routes
- `GET /api/technicians/my-jobs` - Technician's assigned jobs

### User Routes
- `GET /api/users/profile` - User profile

## 🛠️ Technologies Used

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs

## 📦 Package Scripts

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
```

### Backend
```bash
npm run dev          # Start with nodemon (auto-reload)
npm start            # Start production server
node utils/seed.js   # Seed database
```

## 🔒 Security Features
- JWT token-based authentication
- Password hashing with bcrypt
- Protected admin routes
- CORS enabled
- Input validation

## 📱 Pages Overview

### Public Pages
- **Home** (`/`) - Landing page with services
- **Admin Login** (`/admin-login`) - Admin authentication

### Admin Dashboard (`/admin/*`)
- **Dashboard** - Overview statistics
- **Bookings** - Manage all bookings
- **Users** - User management
- **Technicians** - Technician management
- **Analytics** - Business analytics

### Technician Dashboard
- View assigned jobs
- Update job status
- Manage profile

## 🌐 Environment Variables

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend (`backend/.env`)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smartinfotech
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

## 🐛 Troubleshooting

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env

2. **Port Already in Use**
   - Change PORT in backend/.env
   - Update NEXT_PUBLIC_API_URL in frontend .env.local

3. **CORS Issues**
   - Backend CORS is configured for all origins in development
   - Update CORS settings for production

## 📞 Support
For issues or questions, please check the documentation or contact support.
