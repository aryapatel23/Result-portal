const express = require('express');
const router = express.Router();
const { protect, protectAdmin, protectTeacher } = require('../middleware/authMiddleware');
const {
  getTimetable,
  saveTimetable,
  getMyTimetable,
  getStudentTimetable,
  deleteTimetable
} = require('../controllers/timetableController');

// Admin routes - manage any teacher's timetable
router.get('/admin/timetable/:teacherId', protectAdmin, getTimetable);
router.post('/admin/timetable/:teacherId', protectAdmin, saveTimetable);
router.delete('/admin/timetable/:teacherId', protectAdmin, deleteTimetable);

// Teacher routes - view own timetable
router.get('/teacher/timetable', protectTeacher, getMyTimetable);

// Student routes - view class timetable
router.get('/student/timetable', protect, getStudentTimetable);

module.exports = router;
