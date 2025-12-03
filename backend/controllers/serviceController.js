const Service = require('../models/Service');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary from env if available
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json({ services });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getActiveServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ services });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createService = async (req, res) => {
  try {
    const { name, description, serviceCharges, category } = req.body;
    let image = '';

    if (req.file) {
      // If Cloudinary is configured, upload to cloud, otherwise keep local path
      if (cloudinary.config().cloud_name) {
        const uploadResult = await cloudinary.uploader.upload(path.join(__dirname, '..', 'uploads', req.file.filename), {
          folder: 'smarttechinfo',
          use_filename: true,
          unique_filename: false
        });
        image = uploadResult.secure_url;

        // remove local file after upload
        try { fs.unlinkSync(path.join(__dirname, '..', 'uploads', req.file.filename)); } catch (e) {}
      } else {
        image = `/uploads/${req.file.filename}`;
      }
    }

    const service = new Service({ name, description, serviceCharges, image, category });
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, serviceCharges, category, isActive } = req.body;
    const updates = { 
      name, 
      description, 
      serviceCharges: Number(serviceCharges), 
      category,
      isActive: isActive === 'on' || isActive === 'true' || isActive === true
    };
    
    if (req.file) {
      // Delete old image if new one is uploaded
      const oldService = await Service.findById(id);
      if (oldService && oldService.image) {
        // Try to delete local copy if it exists
        try {
          const oldImagePath = path.join(__dirname, '..', oldService.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (e) {}

        // If old image is a Cloudinary URL and Cloudinary configured, attempt to delete it
        try {
          if (cloudinary.config().cloud_name && oldService.image && oldService.image.includes('res.cloudinary.com')) {
            // extract public_id from URL
            const parts = oldService.image.split('/');
            const idx = parts.findIndex(p => p === 'upload');
            if (idx >= 0) {
              const publicPath = parts.slice(idx + 1).join('/');
              // remove transformation if present
              const publicId = publicPath.replace(/v\d+\//, '').replace(/\.[a-zA-Z]+$/, '');
              await cloudinary.uploader.destroy(publicId);
            }
          }
        } catch (e) {
          console.warn('Failed to delete old Cloudinary image', e.message || e);
        }
      }
      // Upload new image to Cloudinary if configured, otherwise store local path
      if (cloudinary.config().cloud_name) {
        const uploadResult = await cloudinary.uploader.upload(path.join(__dirname, '..', 'uploads', req.file.filename), {
          folder: 'smarttechinfo',
          use_filename: true,
          unique_filename: false
        });
        updates.image = uploadResult.secure_url;

        // remove local file after upload
        try { fs.unlinkSync(path.join(__dirname, '..', 'uploads', req.file.filename)); } catch (e) {}
      } else {
        updates.image = `/uploads/${req.file.filename}`;
      }
    }
    
    const service = await Service.findByIdAndUpdate(id, updates, { new: true });
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    
    if (service && service.image) {
      const imagePath = path.join(__dirname, '..', service.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Service.findByIdAndDelete(id);
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Service.distinct('category');
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
