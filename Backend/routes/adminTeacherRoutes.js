const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/authMiddleware');
const {
  getAllTeachers,
  getTeacherPerformance,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  rateTeacher,
  getAdminDashboard,
  createStudent,
  getResultsActivity
} = require('../controllers/adminTeacherController');
const User = require('../models/User');

// @route   GET /api/admin/teachers-list (Public for internal use)
// @desc    Get simple list of all teachers (for result grouping)
// @access  Public
router.get('/teachers-list', async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' })
      .select('_id name employeeId email isActive')
      .sort({ name: 1 });
    res.status(200).json(teachers);
  } catch (error) {
    console.error('Error fetching teachers list:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard with overview
// @access  Admin only
router.get('/dashboard', protectAdmin, getAdminDashboard);

// @route   GET /api/admin/results-activity
// @desc    Get results upload activity by teachers
// @access  Admin only
router.get('/results-activity', protectAdmin, getResultsActivity);

// @route   GET /api/admin/teachers
// @desc    Get all teachers with performance overview
// @access  Admin only
router.get('/teachers', protectAdmin, getAllTeachers);

// @route   GET /api/admin/teachers/:teacherId
// @desc    Get detailed teacher performance
// @access  Admin only
router.get('/teachers/:teacherId', protectAdmin, getTeacherPerformance);

// @route   POST /api/admin/teachers
// @desc    Create new teacher account
// @access  Admin only
router.post('/teachers', protectAdmin, createTeacher);

// @route   PUT /api/admin/teachers/:teacherId
// @desc    Update teacher details
// @access  Admin only
router.put('/teachers/:teacherId', protectAdmin, updateTeacher);

// @route   DELETE /api/admin/teachers/:teacherId
// @desc    Delete/Deactivate teacher
// @access  Admin only
router.delete('/teachers/:teacherId', protectAdmin, deleteTeacher);

// @route   POST /api/admin/teachers/:teacherId/rate
// @desc    Rate teacher performance
// @access  Admin only
router.post('/teachers/:teacherId/rate', protectAdmin, rateTeacher);

// @route   POST /api/admin/students
// @desc    Create student account
// @access  Admin only
router.post('/students', protectAdmin, createStudent);

module.exports = router;
