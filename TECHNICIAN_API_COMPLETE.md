# 🔧 Technician API - Complete Reference

**Base URL:** `http://localhost:5004/api/technicians`

---

## 📋 **Status Flow**

```
1. User Books → "Pending"
2. Admin Assigns → "Scheduled" (Call ❌)
3. Technician Accepts → "Accepted" (Call ✅)
4. [OPTIONAL] On The Way → "On The Way"
5. Generate Start OTP → OTP sent
6. Verify Start OTP → "In Progress" + Completion OTP sent
7. Verify Complete OTP → "Completed"

Alternative: Cancel → "Pending" (removes assignment)
```

---

## 🔐 **Authentication**
All endpoints require:
```
Authorization: Bearer <technician_token>
```

---

## 📡 **API Endpoints**

### **1. Get Profile**
```http
GET /api/technicians/profile
```

**Response:**
```json
{
  "technician": {
    "_id": "tech123",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "specialty": "AC Repair"
  }
}
```

---

### **2. Get Bookings**
```http
GET /api/technicians/bookings
```

Returns bookings assigned to you + pending unassigned bookings.

**Response:**
```json
{
  "bookings": [
    {
      "_id": "booking123",
      "customer": {
        "name": "Customer Name",
        "email": "customer@example.com",
        "phone": "9876543210"
      },
      "service": "AC Repair",
      "status": "Scheduled",
      "date": "2024-01-15",
      "time": "10:00 AM - 12:00 PM",
      "amount": 500
    }
  ]
}
```

---

### **3. Accept Booking** ⭐
```http
PUT /api/technicians/bookings/accept/:id
```

**Requirements:**
- Booking must be "Scheduled" (assigned by admin)
- You must be assigned to this booking

**What happens:**
- Status: "Scheduled" → "Accepted"
- Customer can now call you (phone visible)

**Example:**
```bash
PUT http://localhost:5004/api/technicians/bookings/accept/6932769c4f76034ad15a8cd3
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Booking accepted",
  "booking": {
    "_id": "6932769c4f76034ad15a8cd3",
    "status": "Accepted",
    "technician": {
      "name": "John Doe",
      "phone": "1234567890"
    }
  }
}
```

---

### **4. Cancel Booking** ✅
```http
PUT /api/technicians/bookings/cancel/:id
```

**Requirements:**
- Booking must be "Scheduled" or "Accepted"
- Cannot cancel after work starts

**What happens:**
- Assignment removed
- Status: → "Pending"
- Available for reassignment

**Example:**
```bash
PUT http://localhost:5004/api/technicians/bookings/cancel/6932769c4f76034ad15a8cd3
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Booking cancelled and returned to pending",
  "booking": {
    "_id": "6932769c4f76034ad15a8cd3",
    "status": "Pending",
    "technician": null
  }
}
```

---

### **5. Update to On The Way** (Optional)
```http
PUT /api/technicians/bookings/status/:id
```

**Requirements:**
- Booking must be "Accepted"

**Note:** This step is OPTIONAL. You can skip directly to generating start OTP.

**Example:**
```bash
PUT http://localhost:5004/api/technicians/bookings/status/6932769c4f76034ad15a8cd3
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Status updated to On The Way",
  "booking": {
    "_id": "6932769c4f76034ad15a8cd3",
    "status": "On The Way"
  }
}
```

---

### **6. Generate Start OTP**
```http
POST /api/technicians/bookings/generate-start-otp/:id
```

**Requirements:**
- Booking must be "Accepted" or "On The Way"

**What happens:**
- 6-digit OTP sent to customer's email
- Ask customer for this OTP

**Example:**
```bash
POST http://localhost:5004/api/technicians/bookings/generate-start-otp/6932769c4f76034ad15a8cd3
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Start OTP sent to customer",
  "otp": "123456"  // Only in development mode
}
```

---

### **7. Verify Start OTP** (Start Work)
```http
POST /api/technicians/bookings/verify-start-otp/:id
Content-Type: application/json
```

**Body:**
```json
{
  "otp": "123456"
}
```

**What happens:**
- Status: → "In Progress"
- Completion OTP automatically sent to customer

**Example:**
```bash
POST http://localhost:5004/api/technicians/bookings/verify-start-otp/6932769c4f76034ad15a8cd3
Authorization: Bearer <token>
Content-Type: application/json

{
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "OTP verified. Booking marked In Progress and completion OTP sent to customer."
}
```

---

### **8. Verify Complete OTP** (Complete Work)
```http
POST /api/technicians/bookings/verify-complete-otp/:id
Content-Type: application/json
```

**Body:**
```json
{
  "otp": "654321"
}
```

**What happens:**
- Status: → "Completed"
- Customer can rate service

**Example:**
```bash
POST http://localhost:5004/api/technicians/bookings/verify-complete-otp/6932769c4f76034ad15a8cd3
Authorization: Bearer <token>
Content-Type: application/json

{
  "otp": "654321"
}
```

**Response:**
```json
{
  "message": "Booking marked as Completed",
  "booking": {
    "_id": "6932769c4f76034ad15a8cd3",
    "status": "Completed"
  }
}
```

---

## 🧪 **Complete Test Flow in Postman**

### **Step 1: Login**
```http
POST http://localhost:5004/api/auth/technician/login
Content-Type: application/json

{
  "email": "technician@example.com",
  "password": "password123"
}
```
Save the token.

### **Step 2: View Bookings**
```http
GET http://localhost:5004/api/technicians/bookings
Authorization: Bearer <token>
```

### **Step 3: Accept Booking**
```http
PUT http://localhost:5004/api/technicians/bookings/accept/6932769c4f76034ad15a8cd3
Authorization: Bearer <token>
```
✅ Customer can now call you!

### **Step 4A: (Optional) Update to On The Way**
```http
PUT http://localhost:5004/api/technicians/bookings/status/6932769c4f76034ad15a8cd3
Authorization: Bearer <token>
```

### **Step 4B: OR Skip to Generate Start OTP**
```http
POST http://localhost:5004/api/technicians/bookings/generate-start-otp/6932769c4f76034ad15a8cd3
Authorization: Bearer <token>
```

### **Step 5: Customer Gives OTP, Verify It**
```http
POST http://localhost:5004/api/technicians/bookings/verify-start-otp/6932769c4f76034ad15a8cd3
Authorization: Bearer <token>
Content-Type: application/json

{
  "otp": "123456"
}
```

### **Step 6: Complete Work, Get Completion OTP**
```http
POST http://localhost:5004/api/technicians/bookings/verify-complete-otp/6932769c4f76034ad15a8cd3
Authorization: Bearer <token>
Content-Type: application/json

{
  "otp": "654321"
}
```

---

## ⚠️ **Common Errors & Solutions**

### **"Booking must be in Scheduled status to accept"**
- Admin hasn't assigned the booking yet
- Booking already accepted or in another status

### **"You are not assigned to this booking"**
- Admin assigned to different technician
- Check if you're logged in with correct account

### **"Cannot cancel booking with status: In Progress"**
- Work already started, cannot cancel
- Must complete the booking

### **"Can only set On The Way status after accepting booking"**
- Must accept booking first
- Current status is not "Accepted"

### **"Invalid or expired OTP"**
- OTP entered incorrectly
- OTP already used
- Generate new OTP

### **"On The Way is not a valid enum value"** ✅ FIXED
- Booking model updated
- Restart backend server

---

## 📱 **Customer Dashboard Behavior**

| Status | Call Button | Tooltip |
|--------|------------|---------|
| Pending | ❌ Disabled | "Technician not assigned yet" |
| Scheduled | ❌ Disabled | "Waiting for technician to accept" |
| Accepted | ✅ Enabled | "Call John Doe" |
| On The Way | ✅ Enabled | "Call John Doe" |
| In Progress | ✅ Enabled | "Call John Doe" |
| Completed | - | Can rate service |
| Cancelled | - | - |

---

## 🎨 **Status Colors**

- **Pending**: Gray
- **Scheduled**: Blue
- **Accepted**: Green ✅
- **On The Way**: Purple (Optional)
- **In Progress**: Amber/Orange
- **Completed**: Emerald
- **Cancelled**: Red

---

## ✅ **What's Fixed**

1. ✅ "On The Way" status added to Booking model enum
2. ✅ Cancel booking works for Scheduled/Accepted bookings
3. ✅ Call button only enabled after technician accepts
4. ✅ "On The Way" status is optional (can skip)
5. ✅ Rating and review fields added to Booking model

---

## 🔄 **Two Valid Workflows**

### **Workflow 1: With "On The Way"**
```
Accept → On The Way → Generate OTP → Verify Start → Verify Complete
```

### **Workflow 2: Without "On The Way" (Faster)**
```
Accept → Generate OTP → Verify Start → Verify Complete
```

Both workflows are valid! "On The Way" is optional.

---

## 🚀 **Quick Reference**

| Action | Method | Endpoint |
|--------|--------|----------|
| Get Profile | GET | `/profile` |
| Get Bookings | GET | `/bookings` |
| Accept | PUT | `/bookings/accept/:id` |
| Cancel | PUT | `/bookings/cancel/:id` |
| On The Way | PUT | `/bookings/status/:id` |
| Generate Start OTP | POST | `/bookings/generate-start-otp/:id` |
| Verify Start OTP | POST | `/bookings/verify-start-otp/:id` |
| Verify Complete OTP | POST | `/bookings/verify-complete-otp/:id` |

---

**Now test the status API again:**
```bash
PUT http://localhost:5004/api/technicians/bookings/status/6932769c4f76034ad15a8cd3
Authorization: Bearer <your_token>
```

It should work! 🎉
