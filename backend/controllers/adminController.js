const Booking = require('../models/Booking');
const User = require('../models/User');
const Technician = require('../models/Technician');
const Service = require('../models/Service');
const { exportToCSV } = require('../utils/exportHelpers');

exports.getDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const totalBookings = await Booking.countDocuments(dateFilter);
    const totalUsers = await User.countDocuments();
    const totalTechnicians = await Technician.countDocuments();
    const totalServices = await Service.countDocuments();
    const activeServices = await Service.countDocuments({ isActive: true });
    const totalRevenue = await Booking.aggregate([
      { $match: { status: 'Completed', ...dateFilter } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Revenue by Service
    const revenueByService = await Booking.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: '$service', revenue: { $sum: '$amount' } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    // Recent Activity (last 10 activities)
    const recentBookings = await Booking.find()
      .populate('customer', 'name email')
      .populate('technician', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentActivity = recentBookings.map(b => {
      const timeAgo = getTimeAgo(b.createdAt);
      let text = '';
      if (b.status === 'Completed') {
        text = `${b.technician?.name || 'Technician'} completed ${b.service} for ${b.customer?.name || 'customer'}`;
      } else if (b.status === 'Scheduled') {
        text = `Booking #${b._id.toString().slice(-6)} scheduled (${b.service})`;
      } else if (b.status === 'Pending') {
        text = `New booking: ${b.service} by ${b.customer?.name || 'customer'}`;
      } else {
        text = `Booking #${b._id.toString().slice(-6)} ${b.status.toLowerCase()}`;
      }
      return { id: b._id, text, time: timeAgo };
    });

    // Bookings Trend (last 12 days)
    const bookingsTrend = await Booking.aggregate([
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);

    res.json({
      totalBookings,
      totalUsers,
      totalTechnicians,
      totalServices,
      activeServices,
      totalRevenue: totalRevenue[0]?.total || 0,
      revenueByService: revenueByService.map(s => ({ label: s._id, value: s.revenue })),
      recentActivity,
      bookingsTrend: bookingsTrend.map(b => b.count)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
}

exports.getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let query = {};
    if (status && status !== 'All' && status !== 'All Status') {
      query.status = status;
    }
    
    let bookings = await Booking.find(query)
      .populate('customer', 'name email phone')
      .populate('technician', 'name specialties')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    if (search) {
      const searchLower = search.toLowerCase();
      bookings = bookings.filter(b => 
        b._id.toString().toLowerCase().includes(searchLower) ||
        b.customer?.name?.toLowerCase().includes(searchLower) ||
        b.service?.toLowerCase().includes(searchLower) ||
        b.technician?.name?.toLowerCase().includes(searchLower)
      );
    }
    
    const total = await Booking.countDocuments(query);
    
    res.json({
      bookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let matchStage = {};
    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (status && status !== 'All' && status !== 'All Status') {
      matchStage.status = status;
    }
    
    const users = await User.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      { $sort: { joinedDate: -1 } },
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'customer',
          as: 'bookingsList'
        }
      },
      {
        $addFields: {
          bookings: { $size: '$bookingsList' }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          phone: 1,
          address: 1,
          status: 1,
          joinedDate: 1,
          bookings: 1,
          role: 1
        }
      }
    ])
    .skip(skip)
    .limit(parseInt(limit));
    
    const total = await User.countDocuments(matchStage);
    
    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllTechnicians = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', specialty = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let matchStage = {};
    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: 'i' } },
        // search inside specialties array (match any element)
        { specialties: { $in: [ new RegExp(search, 'i') ] } }
      ];
    }
    if (specialty && specialty !== 'All' && specialty !== 'All Specialties') {
      // filter technicians who have this specialty in their specialties array
      matchStage.specialties = specialty;
    }
    
    const technicians = await Technician.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      { $sort: { createdAt: -1 } },
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
                      {
                        $size: {
                          $filter: {
                            input: '$bookingsList',
                            as: 'booking',
                            cond: { $eq: ['$$booking.status', 'Completed'] }
                          }
                        }
                      },
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
            $cond: [
              {
                $gt: [
                  {
                    $size: {
                      $filter: {
                        input: '$bookingsList',
                        as: 'booking',
                        cond: { $ne: ['$$booking.rating', null] }
                      }
                    }
                  },
                  0
                ]
              },
              {
                $avg: {
                  $map: {
                    input: {
                      $filter: {
                        input: '$bookingsList',
                        as: 'booking',
                        cond: { $ne: ['$$booking.rating', null] }
                      }
                    },
                    as: 'ratedBooking',
                    in: '$$ratedBooking.rating'
                  }
                }
              },
              0
            ]
          }
        }
      },
      {
        $project: {
          password: 0,
          bookingsList: 0
        }
      }
    ])
    .skip(skip)
    .limit(parseInt(limit));
    
    const total = await Technician.countDocuments(matchStage);
    
    res.json({
      technicians,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { service, date, time, amount, status, technician } = req.body;
    
    // Validate status transition
    if (status !== undefined) {
      const currentBooking = await Booking.findById(id);
      if (!isValidStatusTransition(currentBooking.status, status)) {
        return res.status(400).json({ 
          message: `Invalid status transition from ${currentBooking.status} to ${status}` 
        });
      }
    }
    
    // Check technician availability if assigning
    if (technician !== undefined && technician !== null) {
      const currentBooking = await Booking.findById(id);
      const bookingDate = date || currentBooking.date;
      const bookingTime = time || currentBooking.time;
      
      const conflict = await Booking.findOne({
        _id: { $ne: id },
        technician: technician,
        date: bookingDate,
        time: bookingTime,
        status: { $in: ['Pending', 'Scheduled', 'In Progress'] }
      });
      
      if (conflict) {
        return res.status(400).json({ 
          message: 'Technician is already assigned to another booking at this time',
          conflict: true
        });
      }
    }
    
    const updates = {};
    if (service !== undefined) updates.service = service;
    if (date !== undefined) updates.date = date;
    if (time !== undefined) updates.time = time;
    if (amount !== undefined) updates.amount = amount;
    if (status !== undefined) updates.status = status;
    if (technician !== undefined) updates.technician = technician;

    const booking = await Booking.findByIdAndUpdate(id, updates, { new: true })
      .populate('customer', 'name email phone')
      .populate('technician', 'name specialties');
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Status transition validation
function isValidStatusTransition(currentStatus, newStatus) {
  const validTransitions = {
    'Pending': ['Scheduled', 'Cancelled'],
    'Scheduled': ['In Progress', 'Cancelled'],
    'In Progress': ['Completed', 'Cancelled'],
    'Completed': [],
    'Cancelled': []
  };
  
  if (currentStatus === newStatus) return true;
  return validTransitions[currentStatus]?.includes(newStatus) || false;
}

exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    await Booking.findByIdAndDelete(id);
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(id, { status }, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// General update for user (name, email, phone, address, status)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, status } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (status !== undefined) updates.status = status;

    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single user by id (no password)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check for active bookings
    const activeBookings = await Booking.find({
      customer: id,
      status: { $in: ['Pending', 'Scheduled', 'In Progress'] }
    });
    
    if (activeBookings.length > 0) {
      return res.status(400).json({ 
        message: `Cannot delete user with ${activeBookings.length} active booking(s)`,
        activeBookings: activeBookings.length,
        hasActiveBookings: true
      });
    }
    
    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTechnician = async (req, res) => {
  try {
    const { name, email, phone, password, specialty, specialties, street, city, state, pincode } = req.body;
    const bcrypt = require('bcryptjs');
    // If password not provided by admin, generate a random temporary password
    const tempPassword = password || Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    // Normalize specialties: accept `specialties` array or single `specialty` string
    let normalizedSpecialties = [];
    if (Array.isArray(specialties) && specialties.length > 0) normalizedSpecialties = specialties.map(s => String(s).trim()).filter(Boolean);
    else if (typeof specialty === 'string' && specialty.trim() !== '') normalizedSpecialties = [specialty.trim()];

    const technician = new Technician({ name, email, phone, password: hashedPassword, specialties: normalizedSpecialties, street, city, state, pincode });
    await technician.save();
    const response = { ...technician.toObject(), password: undefined };
    // Return temporary password so admin can communicate it securely to technician
    res.status(201).json({ message: 'Technician created successfully', technician: response, tempPassword });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, specialty, specialties, status, street, city, state, pincode, password } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    // Normalize specialties for update: accept `specialties` array or single `specialty` string
    if (specialties !== undefined) {
      if (Array.isArray(specialties)) updates.specialties = specialties.map(s => String(s).trim()).filter(Boolean);
      else if (typeof specialties === 'string' && specialties.trim() !== '') updates.specialties = [specialties.trim()];
      else updates.specialties = [];
    } else if (specialty !== undefined) {
      if (typeof specialty === 'string' && specialty.trim() !== '') updates.specialties = [specialty.trim()];
      else updates.specialties = [];
    }
    if (status !== undefined) updates.status = status;
    if (street !== undefined) updates.street = street;
    if (city !== undefined) updates.city = city;
    if (state !== undefined) updates.state = state;
    if (pincode !== undefined) updates.pincode = pincode;
    
    // Hash password if provided
    if (password !== undefined && password !== '') {
      const bcrypt = require('bcryptjs');
      updates.password = await bcrypt.hash(password, 10);
    }

    const technician = await Technician.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    res.json(technician);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check for active bookings
    const activeBookings = await Booking.find({
      technician: id,
      status: { $in: ['Pending', 'Scheduled', 'In Progress'] }
    });
    
    if (activeBookings.length > 0) {
      return res.status(400).json({ 
        message: `Cannot delete technician with ${activeBookings.length} active booking(s)`,
        activeBookings: activeBookings.length,
        hasActiveBookings: true
      });
    }
    
    await Technician.findByIdAndDelete(id);
    res.json({ message: 'Technician deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.exportBookings = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.exportUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ joinedDate: -1 });
    
    const data = users.map(u => ({
      ID: u._id.toString().slice(-6),
      Name: u.name,
      Email: u.email,
      Phone: u.phone || 'N/A',
      Address: u.address || 'N/A',
      Bookings: u.bookings,
      Status: u.status,
      JoinedDate: new Date(u.joinedDate).toLocaleDateString()
    }));
    
    const csv = exportToCSV(data, 'users');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.exportTechnicians = async (req, res) => {
  try {
    const technicians = await Technician.find().select('-password').sort({ createdAt: -1 });
    
    const data = technicians.map(t => ({
      ID: t._id.toString().slice(-6),
      Name: t.name,
      Email: t.email,
      Phone: t.phone,
      Specialty: (t.specialties && t.specialties.length) ? t.specialties.join(', ') : t.specialty,
      Rating: t.rating,
      Services: t.services,
      Status: t.status,
      CreatedAt: new Date(t.createdAt).toLocaleDateString()
    }));
    
    const csv = exportToCSV(data, 'technicians');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=technicians.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password || '123456', 10);
    const user = new User({ name, email, phone, password: hashedPassword, address });
    await user.save();
    res.status(201).json({ ...user.toObject(), password: undefined });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { customer, service, date, time, amount, technician, status } = req.body;
    
    // Check technician availability if assigned
    if (technician) {
      const conflict = await Booking.findOne({
        technician,
        date,
        time,
        status: { $in: ['Pending', 'Scheduled', 'In Progress'] }
      });
      
      if (conflict) {
        return res.status(400).json({ 
          message: 'Technician is already assigned to another booking at this time',
          conflict: true
        });
      }
    }
    
    const booking = new Booking({
      customer,
      service,
      date,
      time,
      amount,
      technician: technician || null,
      status: status || 'Pending'
    });
    
    await booking.save();
    const populatedBooking = await Booking.findById(booking._id)
      .populate('customer', 'name email phone')
      .populate('technician', 'name specialty');
    
    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    // Total Revenue
    const revenueData = await Booking.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    // Total Bookings
    const totalBookings = await Booking.countDocuments();

    // Average Rating
    const ratingData = await Booking.aggregate([
      { $match: { rating: { $ne: null } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    const avgRating = ratingData[0]?.avgRating || 0;

    // Completion Rate
    const completedCount = await Booking.countDocuments({ status: 'Completed' });
    const completionRate = totalBookings > 0 ? (completedCount / totalBookings) * 100 : 0;

    // Revenue Trend (last 12 periods)
    const revenueTrend = await Booking.aggregate([
      { $match: { status: 'Completed' } },
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);

    // Service Distribution
    const serviceDistribution = await Booking.aggregate([
      { $group: { _id: '$service', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const totalServices = serviceDistribution.reduce((acc, s) => acc + s.count, 0);
    const services = serviceDistribution.map(s => ({
      label: s._id,
      value: totalServices > 0 ? Math.round((s.count / totalServices) * 100) : 0
    }));

    // Top Technicians
    const topTechnicians = await Booking.aggregate([
      { $match: { technician: { $ne: null } } },
      {
        $group: {
          _id: '$technician',
          jobs: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { jobs: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'technicians',
          localField: '_id',
          foreignField: '_id',
          as: 'techInfo'
        }
      },
      { $unwind: '$techInfo' },
      {
        $project: {
          name: '$techInfo.name',
          jobs: 1,
          rating: { $ifNull: ['$avgRating', 0] }
        }
      }
    ]);

    // Top Customers
    const topCustomers = await Booking.aggregate([
      {
        $group: {
          _id: '$customer',
          bookings: { $sum: 1 },
          spent: { $sum: '$amount' }
        }
      },
      { $sort: { spent: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          name: '$userInfo.name',
          bookings: 1,
          spent: 1
        }
      }
    ]);

    res.json({
      stats: {
        totalRevenue,
        totalBookings,
        avgRating: avgRating.toFixed(1),
        completionRate: completionRate.toFixed(1)
      },
      revenueTrend: revenueTrend.map(r => r.revenue),
      serviceDistribution: services,
      topTechnicians,
      topCustomers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
