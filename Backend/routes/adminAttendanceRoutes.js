const express = require('express');
const router = express.Router();
const {
  getAllAttendance,
  getTodaySummary,
  getTeacherAttendance,
  markAttendanceByAdmin,
  updateAttendance,
  deleteAttendance,
  getAttendanceReport,
  triggerAutoAttendance
} = require('../controllers/teacherAttendanceController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Admin routes
router.get('/all', protectAdmin, getAllAttendance);
router.get('/today-summary', protectAdmin, getTodaySummary);
router.get('/teacher/:teacherId', protectAdmin, getTeacherAttendance);
router.get('/report', protectAdmin, getAttendanceReport);
router.post('/mark', protectAdmin, markAttendanceByAdmin);
router.put('/update/:id', protectAdmin, updateAttendance);
router.delete('/delete/:id', protectAdmin, deleteAttendance);
router.post('/auto-mark-leaves', protectAdmin, triggerAutoAttendance); // Manual trigger for auto-attendance

module.exports = router;
