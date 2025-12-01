const express = require('express');
const router = express.Router();
const { adminLogin, technicianLogin, userRegister, userLogin } = require('../controllers/authController');

// Public auth routes
router.post('/admin/login', adminLogin);
router.post('/technician/login', technicianLogin);
// Generic user login endpoint used by frontend
router.post('/login', userLogin);
router.post('/user/register', userRegister);

module.exports = router;
