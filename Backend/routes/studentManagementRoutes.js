const express = require('express');
const router = express.Router();
const { protectTeacher } = require('../middleware/authMiddleware');
const {
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  bulkDeleteStudents,
  getStudentStats,
  exportStudents
} = require('../controllers/studentManagementController');

// @route   GET /api/student-management/stats/overview
// @desc    Get student statistics
// @access  Teacher/Admin
router.get('/stats/overview', protectTeacher, getStudentStats);

// @route   GET /api/student-management/export
// @desc    Export students to Excel
// @access  Teacher/Admin
router.get('/export', protectTeacher, exportStudents);

// @route   GET /api/student-management
// @desc    Get all students with filters
// @access  Teacher/Admin
router.get('/', protectTeacher, getAllStudents);

// @route   POST /api/student-management/bulk-delete
// @desc    Bulk delete students
// @access  Teacher/Admin
router.post('/bulk-delete', protectTeacher, bulkDeleteStudents);

// @route   GET /api/student-management/:id
// @desc    Get student by ID with results
// @access  Teacher/Admin
router.get('/:id', protectTeacher, getStudentById);

// @route   PUT /api/student-management/:id
// @desc    Update student
// @access  Teacher/Admin
router.put('/:id', protectTeacher, updateStudent);

// @route   DELETE /api/student-management/:id
// @desc    Delete student and their results
// @access  Teacher/Admin
router.delete('/:id', protectTeacher, deleteStudent);

module.exports = router;
