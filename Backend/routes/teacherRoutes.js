const express = require('express');
const router = express.Router();
const { protectTeacher } = require('../middleware/authMiddleware');
const {
  getTeacherDashboard,
  uploadResultByTeacher,
  getMyResults,
  getResultById,
  editResult,
  deleteResult,
  getMyPerformance
} = require('../controllers/teacherController');

// @route   GET /api/teacher/dashboard
// @desc    Get teacher dashboard
// @access  Teacher only
router.get('/dashboard', protectTeacher, getTeacherDashboard);

// @route   POST /api/teacher/results
// @desc    Upload result (teacher can only upload for assigned classes)
// @access  Teacher only
router.post('/results', protectTeacher, uploadResultByTeacher);

// @route   GET /api/teacher/results
// @desc    Get results uploaded by this teacher
// @access  Teacher only
router.get('/results', protectTeacher, getMyResults);

// @route   GET /api/teacher/results/:id
// @desc    Get single result by ID (only if uploaded by this teacher)
// @access  Teacher only
router.get('/results/:id', protectTeacher, getResultById);

// @route   PUT /api/teacher/results/:id
// @desc    Edit result (only if uploaded by this teacher)
// @access  Teacher only
router.put('/results/:id', protectTeacher, editResult);

// @route   DELETE /api/teacher/results/:id
// @desc    Delete result (only if uploaded by this teacher)
// @access  Teacher only
router.delete('/results/:id', protectTeacher, deleteResult);

// @route   GET /api/teacher/performance
// @desc    Get teacher's own performance metrics
// @access  Teacher only
router.get('/performance', protectTeacher, getMyPerformance);

module.exports = router;
