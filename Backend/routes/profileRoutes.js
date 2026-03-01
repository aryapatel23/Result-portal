const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMyProfile, updateProfile, changePassword } = require('../controllers/profileController');
const { validateChangePassword } = require('../middleware/validationMiddleware');

// All profile routes are protected (require any valid token)
router.get('/me', protect, getMyProfile);
router.put('/update', protect, updateProfile);
router.put('/change-password', protect, validateChangePassword, changePassword);

module.exports = router;
