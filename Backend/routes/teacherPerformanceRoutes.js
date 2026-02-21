const express = require('express');
const router = express.Router();
const { 
  getAllTeachersPerformance, 
  getTeacherPerformance,
  getPerformanceLeaderboard
} = require('../controllers/teacherPerformanceController');
const { protect, protectAdmin } = require('../middleware/authMiddleware');

// All routes protected by authentication
router.use(protect);

/**
 * @route   GET /api/performance/teachers
 * @desc    Get performance data for all teachers
 * @access  Admin only
 */
router.get('/teachers', protectAdmin, getAllTeachersPerformance);

/**
 * @route   GET /api/performance/leaderboard
 * @desc    Get top performing teachers
 * @access  Admin only
 */
router.get('/leaderboard', protectAdmin, getPerformanceLeaderboard);

/**
 * @route   GET /api/performance/teacher/:teacherId
 * @desc    Get performance data for specific teacher
 * @access  Admin or teacher (own data)
 */
router.get('/teacher/:teacherId', async (req, res, next) => {
  // Admin can view any teacher, teachers can only view their own
  if (req.user.role === 'admin' || req.user._id.toString() === req.params.teacherId) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized' });
  }
}, getTeacherPerformance);

module.exports = router;
