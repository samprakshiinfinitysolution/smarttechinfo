# 📊 Analytics & Export Features

## 1. Revenue Analytics with Date Range Filter ✅

### Location
- **Admin Dashboard**: `/admin/dashboard`

### Features
- Date range picker (Start Date & End Date)
- Filter revenue by custom date range
- Apply/Clear filter buttons
- Real-time stats update based on selected range

### Backend Implementation
```javascript
// GET /api/admin/stats?startDate=2024-01-01&endDate=2024-12-31
exports.getDashboardStats = async (req, res) => {
  const { startDate, endDate } = req.query;
  
  let dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  }

  const totalRevenue = await Booking.aggregate([
    { $match: { status: 'Completed', ...dateFilter } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
}
```

### Frontend Implementation
```typescript
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");

const fetchStats = async () => {
  let url = `http://localhost:5000/api/admin/stats`;
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (params.toString()) url += `?${params.toString()}`;
  
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  setStats(data);
};
```

---

## 2. Technician Performance Metrics ✅

### Location
- **Admin Technicians Page**: `/admin/technicians`

### Metrics Tracked
1. **Total Jobs** - Total number of jobs assigned
2. **Completed Jobs** - Number of completed jobs
3. **Completion Rate** - Percentage of completed jobs
4. **Average Rating** - Average rating from customer reviews
5. **Response Time** - (Future enhancement)

### Backend Aggregation
```javascript
exports.getAllTechnicians = async (req, res) => {
  const technicians = await Technician.aggregate([
    {
      $lookup: {
        from: 'bookings',
        localField: '_id',
        foreignField: 'technician',
        as: 'bookingsList'
      }
    },
    {
      $addFields: {
        totalJobs: { $size: '$bookingsList' },
        completedJobs: {
          $size: {
            $filter: {
              input: '$bookingsList',
              as: 'booking',
              cond: { $eq: ['$$booking.status', 'Completed'] }
            }
          }
        },
        completionRate: {
          $cond: [
            { $gt: [{ $size: '$bookingsList' }, 0] },
            {
              $multiply: [
                {
                  $divide: [
                    { $size: { $filter: { ... } } },
                    { $size: '$bookingsList' }
                  ]
                },
                100
              ]
            },
            0
          ]
        },
        avgRating: {
          $avg: {
            $map: {
              input: { $filter: { ... } },
              as: 'ratedBooking',
              in: '$$ratedBooking.rating'
            }
          }
        }
      }
    }
  ]);
};
```

### Display Format
- **Rating**: Yellow badge with star icon (e.g., "4.5 ⭐")
- **Completion Rate**: Percentage below rating (e.g., "85% complete")
- **Total Jobs**: Main number display
- **Completed Jobs**: Green text below total (e.g., "12 completed")

---

## 3. CSV Export Functionality ✅

### Endpoints
- `GET /api/admin/export/bookings` - Export all bookings
- `GET /api/admin/export/users` - Export all users
- `GET /api/admin/export/technicians` - Export all technicians

### Backend Implementation
```javascript
const { exportToCSV } = require('../utils/exportHelpers');

exports.exportBookings = async (req, res) => {
  const bookings = await Booking.find()
    .populate('customer', 'name email phone')
    .populate('technician', 'name specialty')
    .sort({ createdAt: -1 });
  
  const data = bookings.map(b => ({
    ID: b._id.toString().slice(-6),
    Customer: b.customer?.name || 'N/A',
    Email: b.customer?.email || 'N/A',
    Phone: b.customer?.phone || 'N/A',
    Service: b.service,
    Technician: b.technician?.name || 'Unassigned',
    Date: b.date,
    Time: b.time,
    Amount: b.amount,
    Status: b.status,
    Rating: b.rating || 'N/A',
    CreatedAt: new Date(b.createdAt).toLocaleDateString()
  }));
  
  const csv = exportToCSV(data, 'bookings');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=bookings.csv');
  res.send(csv);
};
```

### Export Helper Utility
```javascript
// backend/utils/exportHelpers.js
const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      return `"${val !== null && val !== undefined ? String(val).replace(/"/g, '""') : ''}"`;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};
```

### Frontend Implementation
```typescript
// Bookings Export
<button 
  onClick={() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      window.open(`http://localhost:5000/api/admin/export/bookings?token=${token}`, '_blank');
    }
  }}
  className="px-6 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
>
  <svg>...</svg>
  Export CSV
</button>
```

### Export Data Format

#### Bookings CSV
```csv
ID,Customer,Email,Phone,Service,Technician,Date,Time,Amount,Status,Rating,CreatedAt
abc123,John Doe,john@example.com,9876543210,AC Repair,Mike Smith,2024-01-15,9:00 AM – 11:00 AM,499,Completed,5,1/15/2024
```

#### Users CSV
```csv
ID,Name,Email,Phone,Address,Bookings,Status,JoinedDate
def456,Jane Smith,jane@example.com,9876543211,123 Main St,5,Active,1/10/2024
```

#### Technicians CSV
```csv
ID,Name,Email,Phone,Specialty,Rating,Services,Status,CreatedAt
ghi789,Mike Smith,mike@example.com,9876543212,AC Repair,4.5,25,Available,12/1/2023
```

---

## 📊 Dashboard Statistics

### Metrics Displayed
1. **Total Revenue** - Sum of all completed bookings (with date filter)
2. **Total Bookings** - Count of all bookings (with date filter)
3. **Total Users** - Count of all registered users
4. **Total Technicians** - Count of all technicians

### Date Range Filter UI
```
┌─────────────────────────────────────────────────────┐
│ Revenue Analytics - Date Range Filter              │
├─────────────────────────────────────────────────────┤
│ Start Date: [2024-01-01] End Date: [2024-12-31]   │
│ [Apply Filter] [Clear]                             │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Performance Metrics Display

### Technicians Table
```
┌──────────────────────────────────────────────────────────┐
│ Name      │ Specialty    │ Rating      │ Services        │
├──────────────────────────────────────────────────────────┤
│ Mike      │ AC Repair    │ 4.5 ⭐      │ 25              │
│           │              │ 85% complete│ 21 completed    │
└──────────────────────────────────────────────────────────┘
```

---

## 🚀 Usage Instructions

### Date Range Filter
1. Go to Admin Dashboard (`/admin/dashboard`)
2. Enter Start Date and End Date
3. Click "Apply Filter" to see filtered revenue
4. Click "Clear" to reset to all-time stats

### Export Data
1. Go to respective admin page (Bookings/Users/Technicians)
2. Click "Export CSV" button (green button with download icon)
3. CSV file will download automatically
4. Open in Excel, Google Sheets, or any CSV viewer

### View Performance Metrics
1. Go to Technicians page (`/admin/technicians`)
2. View metrics in the table:
   - Rating column shows average rating and completion rate
   - Services column shows total jobs and completed jobs
3. Metrics update automatically when data changes

---

## 🔐 Security

- All export endpoints require admin authentication
- Token passed via query parameter for download links
- JWT validation on every request
- Only admin role can access export functionality

---

## 📈 Future Enhancements

### Advanced Analytics
- Revenue trends chart (daily/weekly/monthly)
- Service-wise revenue breakdown
- Technician performance comparison
- Customer retention metrics

### Export Enhancements
- PDF export with formatted reports
- Excel export with multiple sheets
- Scheduled email reports
- Custom column selection

### Performance Metrics
- Response time tracking
- Customer satisfaction score
- First-time fix rate
- Average job duration

---

## 🧪 Testing

### Test Date Range Filter
```bash
# Test with date range
curl "http://localhost:5000/api/admin/stats?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test without date range (all-time)
curl "http://localhost:5000/api/admin/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test CSV Export
```bash
# Export bookings
curl "http://localhost:5000/api/admin/export/bookings" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o bookings.csv

# Export users
curl "http://localhost:5000/api/admin/export/users" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o users.csv

# Export technicians
curl "http://localhost:5000/api/admin/export/technicians" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o technicians.csv
```

---

## 📄 Files Modified/Created

### Backend
- `backend/controllers/adminController.js` - Added date filter, performance metrics, export functions
- `backend/routes/adminRoutes.js` - Added export routes
- `backend/utils/exportHelpers.js` - Created CSV export utility

### Frontend
- `src/app/admin/dashboard/page.tsx` - Added date range filter UI
- `src/app/admin/technicians/page.tsx` - Added export button, performance metrics display
- `src/app/admin/bookings/page.tsx` - Added export button

---

**Built with ❤️ - Smart Info Tech**
