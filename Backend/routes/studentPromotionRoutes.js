const express = require('express');
const router = express.Router();
const { protectTeacher } = require('../middleware/authMiddleware');
const {
  promoteSingleStudent,
  bulkPromoteStudents,
  getStudentsByStandard
} = require('../controllers/studentPromotionController');

// @route   POST /api/student-promotion/single
// @desc    Promote single student to next standard
// @access  Admin and Teacher
router.post('/single', protectTeacher, promoteSingleStudent);

// @route   POST /api/student-promotion/bulk
// @desc    Bulk promote students
// @access  Admin and Teacher
router.post('/bulk', protectTeacher, bulkPromoteStudents);

// @route   GET /api/student-promotion/by-standard/:standard
// @desc    Get all students in a specific standard
// @access  Admin and Teacher
router.get('/by-standard/:standard', protectTeacher, getStudentsByStandard);

module.exports = router;
