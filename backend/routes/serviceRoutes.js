const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authMiddleware, adminAuth } = require('../middleware/auth');
const {
  getAllServices,
  getActiveServices,
  createService,
  updateService,
  deleteService,
  getCategories
} = require('../controllers/serviceController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

router.get('/active', getActiveServices);
router.get('/categories', authMiddleware, adminAuth, getCategories);
router.get('/', authMiddleware, adminAuth, getAllServices);
router.post('/', authMiddleware, adminAuth, upload.single('image'), createService);
router.put('/:id', authMiddleware, adminAuth, upload.single('image'), updateService);
router.delete('/:id', authMiddleware, adminAuth, deleteService);

module.exports = router;
