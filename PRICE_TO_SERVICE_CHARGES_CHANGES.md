# Price to Service Charges Migration

## Summary
Changed all references from "price" to "serviceCharges" across the application to better reflect that services have specific charges rather than general pricing.

## Files Modified

### 1. Backend - Database Model
**File:** `backend/models/Service.js`
- Changed field name from `price` to `serviceCharges`
- This is the core data model change

### 2. Backend - Controller
**File:** `backend/controllers/serviceController.js`
- Updated `createService` function to use `serviceCharges` instead of `price`
- Updated `updateService` function to use `serviceCharges` instead of `price`

### 3. Backend - Seed Data
**File:** `backend/utils/seed.js`
- Updated all service seed data to use `serviceCharges` field
- Services now have:
  - AC Repair & Service: ₹599
  - Washing Machine Repair: ₹450
  - Refrigerator Repair: ₹750
  - TV Repair Service: ₹500
  - Microwave Repair: ₹350
  - Water Purifier Service: ₹400

### 4. Frontend - Services Page (Customer View)
**File:** `src/app/services/page.tsx`
- Updated display to show `item.serviceCharges` instead of `item.price`
- Label remains as price symbol (₹) for customer clarity

### 5. Frontend - Admin Services Management
**File:** `src/app/admin/services/page.tsx`
- Updated service card display to show `service.serviceCharges`
- Changed form label from "Price (₹)" to "Service Charges (₹)"
- Updated form input name from `price` to `serviceCharges`
- Updated default value to use `showEditModal?.serviceCharges`

## Database Migration Required

After deploying these changes, you need to:

1. **Re-seed the database** to update existing services:
   ```bash
   cd backend
   node utils/seed.js
   ```

2. **Or manually update existing services** in MongoDB:
   ```javascript
   db.services.updateMany(
     {},
     { $rename: { "price": "serviceCharges" } }
   )
   ```

## Testing Checklist

- [ ] Backend API returns `serviceCharges` field
- [ ] Admin can create new services with service charges
- [ ] Admin can edit existing services and update charges
- [ ] Customer services page displays charges correctly
- [ ] Service cards show the correct amount
- [ ] Booking flow uses correct service charges

## Notes

- The booking `amount` field remains unchanged as it represents the total booking cost (service charges + visit charges)
- All monetary values continue to use Indian Rupee (₹) symbol
- The change is primarily semantic - "service charges" is more accurate than "price" for service-based businesses
