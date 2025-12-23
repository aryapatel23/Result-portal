const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/authMiddleware');
const { protectTeacher } = require('../middleware/authMiddleware');
const {
  getTimetable,
  saveTimetable,
  getMyTimetable,
  deleteTimetable
} = require('../controllers/timetableController');

// Admin routes - manage any teacher's timetable
router.get('/admin/timetable/:teacherId', protectAdmin, getTimetable);
router.post('/admin/timetable/:teacherId', protectAdmin, saveTimetable);
router.delete('/admin/timetable/:teacherId', protectAdmin, deleteTimetable);

// Teacher routes - view own timetable
router.get('/teacher/timetable', protectTeacher, getMyTimetable);

module.exports = router;
