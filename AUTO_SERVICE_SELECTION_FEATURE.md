# Auto Service Selection Feature

## Overview
When users click "Book Now" on any service in the services page, they are redirected to the booking page with that service automatically pre-selected.

## Implementation

### 1. Services Page Update
**File:** `src/app/services/page.tsx`

**Change:**
```tsx
// Before
<Link href="/Book">
  <button>Book Now</button>
</Link>

// After
<Link href={`/Book?service=${encodeURIComponent(item.name || item.title)}`}>
  <button>Book Now</button>
</Link>
```

**What it does:**
- Passes the service name as a URL query parameter
- Uses `encodeURIComponent` to handle special characters in service names
- Example URL: `/Book?service=AC%20Repair%20%26%20Service`

### 2. Book Page Update
**File:** `src/app/Book/page.tsx`

**Changes:**

1. **Import useSearchParams:**
```tsx
import { useRouter, useSearchParams } from "next/navigation";
```

2. **Initialize searchParams:**
```tsx
const searchParams = useSearchParams();
```

3. **Auto-select service from URL:**
```tsx
useEffect(() => {
  const fetchServices = async () => {
    // ... fetch services code ...
    
    // Auto-select service from URL parameter
    const serviceParam = searchParams.get('service');
    if (serviceParam && chargesMap[serviceParam]) {
      setService(serviceParam);
    }
  };
  fetchServices();
}, [searchParams]);
```

## User Flow

### Before:
1. User views services page
2. User clicks "Book Now" on AC Repair
3. User redirected to booking page
4. **User must manually select AC Repair from dropdown** ❌

### After:
1. User views services page
2. User clicks "Book Now" on AC Repair
3. User redirected to booking page
4. **AC Repair is automatically selected** ✅
5. Service charges automatically displayed
6. User can proceed directly to fill other details

## Benefits

### ✅ Better UX
- Saves user time
- Reduces friction in booking flow
- One less step for the user

### ✅ Seamless Navigation
- Smooth transition from browsing to booking
- Context is preserved across pages
- User intent is maintained

### ✅ Fewer Errors
- Reduces chance of selecting wrong service
- User doesn't need to remember which service they clicked
- Direct path to booking completion

### ✅ Professional Experience
- Modern e-commerce pattern
- Expected behavior in booking systems
- Polished user experience

## Technical Details

### URL Structure
```
/Book?service=AC%20Repair%20%26%20Service
```

### Query Parameter
- **Key:** `service`
- **Value:** URL-encoded service name
- **Example:** `AC Repair & Service` → `AC%20Repair%20%26%20Service`

### Validation
- Checks if service exists in fetched services list
- Only sets service if it's valid and active
- Prevents errors from invalid/inactive services

### Edge Cases Handled
1. **Invalid service name:** Service not set, user selects manually
2. **Inactive service:** Service not in list, user selects manually
3. **No query parameter:** Normal flow, user selects manually
4. **Special characters:** Properly encoded/decoded

## Testing Checklist

- [ ] Click "Book Now" on each service
- [ ] Verify correct service is pre-selected
- [ ] Check service charges display correctly
- [ ] Test with services containing special characters
- [ ] Verify direct navigation to /Book still works
- [ ] Test on mobile devices
- [ ] Verify URL encoding/decoding works properly

## Example URLs

```
/Book?service=AC%20Repair%20%26%20Service
/Book?service=Washing%20Machine%20Repair
/Book?service=Refrigerator%20Repair
/Book?service=TV%20Repair%20Service
/Book?service=Microwave%20Repair
/Book?service=Water%20Purifier%20Service
```

## Future Enhancements

Potential improvements:
- Pre-fill date/time if passed as parameters
- Add service ID instead of name for better reliability
- Store last selected service in localStorage
- Add "Continue Booking" feature for incomplete bookings
