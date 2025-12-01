const Service = require('../models/Service');
const fs = require('fs');
const path = require('path');

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
    const image = req.file ? `/uploads/${req.file.filename}` : '';
    
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
        const oldImagePath = path.join(__dirname, '..', oldService.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updates.image = `/uploads/${req.file.filename}`;
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
