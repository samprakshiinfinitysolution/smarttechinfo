# Technician API - Complete Workflow

## 📋 Booking Status Flow

```
1. User Books Service → Status: "Pending"
2. Admin Assigns Technician → Status: "Scheduled" (Call button DISABLED)
3. Technician Accepts → Status: "Accepted" (Call button ENABLED)
4. Technician On The Way → Status: "On The Way"
5. Technician Generates Start OTP → OTP sent to customer
6. Customer Provides OTP to Technician → Status: "In Progress" + Completion OTP sent
7. Work Completed, Customer Provides Completion OTP → Status: "Completed"

Alternative: Technician Cancels → Status: "Cancelled"
```

## 🔐 Authentication
All routes require Bearer token in Authorization header:
```
Authorization: Bearer <technician_token>
```

## 📡 API Endpoints

### 1. Get Technician Profile
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

### 2. Get Bookings
```http
GET /api/technicians/bookings
```
Returns:
- Bookings assigned to this technician
- Pending unassigned bookings (available to accept)

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
      "time": "10:00 AM - 12:00 PM"
    }
  ]
}
```

---

### 3. Accept Booking ⭐
```http
PUT /api/technicians/bookings/accept/:bookingId
```
**Requirements:**
- Booking must be in "Scheduled" status (assigned by admin)
- Technician must be assigned to this booking

**What happens:**
- Status changes: "Scheduled" → "Accepted"
- Customer can now call technician (phone number becomes visible)

**Example:**
```http
PUT /api/technicians/bookings/accept/69316eabd1d60f61c582a622
```

**Response:**
```json
{
  "message": "Booking accepted",
  "booking": {
    "_id": "69316eabd1d60f61c582a622",
    "status": "Accepted",
    "technician": {
      "name": "John Doe",
      "specialty": "AC Repair",
      "phone": "1234567890"
    }
  }
}
```

---

### 4. Update Status to "On The Way"
```http
PUT /api/technicians/bookings/status/:bookingId
```
**Requirements:**
- Booking must be in "Accepted" status
- Technician must be assigned to this booking

**What happens:**
- Status changes: "Accepted" → "On The Way"

**Example:**
```http
PUT /api/technicians/bookings/status/69316eabd1d60f61c582a622
```

**Response:**
```json
{
  "message": "Status updated to On The Way",
  "booking": {
    "_id": "69316eabd1d60f61c582a622",
    "status": "On The Way"
  }
}
```

---

### 5. Generate Start OTP
```http
POST /api/technicians/bookings/generate-start-otp/:bookingId
```
**Requirements:**
- Booking must be in "Accepted" or "On The Way" status
- Customer must have email

**What happens:**
- 6-digit OTP generated and sent to customer's email
- Technician asks customer for this OTP to start work

**Example:**
```http
POST /api/technicians/bookings/generate-start-otp/69316eabd1d60f61c582a622
```

**Response:**
```json
{
  "message": "Start OTP sent to customer",
  "otp": "123456"  // Only in development mode
}
```

---

### 6. Verify Start OTP (Start Work)
```http
POST /api/technicians/bookings/verify-start-otp/:bookingId
Content-Type: application/json

{
  "otp": "123456"
}
```
**Requirements:**
- Valid start OTP from customer

**What happens:**
- Status changes: "Accepted"/"On The Way" → "In Progress"
- Completion OTP automatically generated and sent to customer
- Work officially started

**Example:**
```http
POST /api/technicians/bookings/verify-start-otp/69316eabd1d60f61c582a622
```

**Body:**
```json
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

### 7. Verify Completion OTP (Complete Work)
```http
POST /api/technicians/bookings/verify-complete-otp/:bookingId
Content-Type: application/json

{
  "otp": "654321"
}
```
**Requirements:**
- Valid completion OTP from customer
- Booking must be in "In Progress" status

**What happens:**
- Status changes: "In Progress" → "Completed"
- Work officially completed
- Customer can now rate the service

**Example:**
```http
POST /api/technicians/bookings/verify-complete-otp/69316eabd1d60f61c582a622
```

**Body:**
```json
{
  "otp": "654321"
}
```

**Response:**
```json
{
  "message": "Booking marked as Completed",
  "booking": {
    "_id": "69316eabd1d60f61c582a622",
    "status": "Completed"
  }
}
```

---

### 8. Cancel Booking (Reject Assignment)
```http
PUT /api/technicians/bookings/cancel/:bookingId
```
**Requirements:**
- Technician must be assigned to this booking
- Booking must be in "Scheduled", "Accepted", or "On The Way" status
- Cannot cancel if work has started (In Progress) or completed

**What happens:**
- Technician assignment removed
- Status changes back to "Pending"
- Booking becomes available for admin to reassign

**Example:**
```http
PUT /api/technicians/bookings/cancel/69316eabd1d60f61c582a622
```

**Response:**
```json
{
  "message": "Booking cancelled and returned to pending",
  "booking": {
    "_id": "69316eabd1d60f61c582a622",
    "status": "Pending",
    "technician": null
  }
}
```

---

## 🎯 Complete Testing Flow in Postman

### Step 1: Login as Technician
```http
POST /api/auth/technician/login
Content-Type: application/json

{
  "email": "technician@example.com",
  "password": "password123"
}
```
Save the token from response.

### Step 2: Get Profile
```http
GET /api/technicians/profile
Authorization: Bearer <token>
```

### Step 3: View Available Bookings
```http
GET /api/technicians/bookings
Authorization: Bearer <token>
```

### Step 4: Accept a Scheduled Booking
```http
PUT /api/technicians/bookings/accept/69316eabd1d60f61c582a622
Authorization: Bearer <token>
```
✅ Now customer can call you!

### Step 5: Update to On The Way
```http
PUT /api/technicians/bookings/status/69316eabd1d60f61c582a622
Authorization: Bearer <token>
```

### Step 6: Generate Start OTP
```http
POST /api/technicians/bookings/generate-start-otp/69316eabd1d60f61c582a622
Authorization: Bearer <token>
```

### Step 7: Customer Gives OTP, Verify It
```http
POST /api/technicians/bookings/verify-start-otp/69316eabd1d60f61c582a622
Authorization: Bearer <token>
Content-Type: application/json

{
  "otp": "123456"
}
```

### Step 8: Complete Work, Get Completion OTP from Customer
```http
POST /api/technicians/bookings/verify-complete-otp/69316eabd1d60f61c582a622
Authorization: Bearer <token>
Content-Type: application/json

{
  "otp": "654321"
}
```

---

## 🔒 Key Security Features

1. **Phone Privacy**: Technician phone only visible after accepting booking
2. **OTP Verification**: Two-step OTP process ensures both parties are present
3. **Status Validation**: Each status transition is validated
4. **Authorization**: Technicians can only modify their assigned bookings

---

## ⚠️ Common Errors

### "Booking must be in Scheduled status to accept"
- Admin hasn't assigned the booking yet
- Booking is already accepted or in another status

### "You are not assigned to this booking"
- Admin assigned booking to different technician
- Trying to accept unassigned booking

### "Can only generate start OTP after accepting booking"
- Must accept booking first before generating OTP

### "Invalid or expired OTP"
- OTP entered incorrectly
- OTP already used
- Need to regenerate OTP

---

## 📱 Customer Dashboard Behavior

- **Pending**: No technician assigned, no call button
- **Scheduled**: Technician assigned by admin, call button DISABLED (gray), tooltip: "Waiting for technician to accept"
- **Accepted**: Technician accepted, call button ENABLED (green), can call technician
- **On The Way**: Technician coming, call button ENABLED
- **In Progress**: Work started, call button ENABLED
- **Completed**: Work done, can rate service
- **Cancelled**: Booking cancelled

---

## 🎨 Status Colors in UI

- **Pending**: Gray
- **Scheduled**: Blue
- **Accepted**: Green
- **On The Way**: Purple
- **In Progress**: Amber/Orange
- **Completed**: Emerald/Green
- **Cancelled**: Red/Gray
