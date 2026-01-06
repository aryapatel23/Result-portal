const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getTodayStatus,
  getMyHistory
} = require('../controllers/teacherAttendanceController');
const { protectTeacher } = require('../middleware/authMiddleware');

// Teacher routes
router.post('/mark', protectTeacher, markAttendance);
router.get('/today', protectTeacher, getTodayStatus);
router.get('/my-history', protectTeacher, getMyHistory);

module.exports = router;
