const express = require('express');
const router = express.Router();
const { protectStudent } = require('../middleware/authMiddleware');
const {
  studentLogin,
  getMyResults,
  getMyProfile,
  viewResult,
  viewLatestResult,
  getStudentByGR
} = require('../controllers/studentController');

// @route   POST /api/student/login
// @desc    Student login with GR number and DOB
// @access  Public
router.post('/login', studentLogin);

// @route   GET /api/student/latest-result
// @desc    View latest result without login (public access)
// @access  Public
router.get('/latest-result', viewLatestResult);

// @route   GET /api/student/gr/:grNumber
// @desc    Get student info by GR Number (for result upload auto-fill)
// @access  Public
router.get('/gr/:grNumber', getStudentByGR);

// @route   GET /api/student/results
// @desc    Get student's own results
// @access  Student only
router.get('/results', protectStudent, getMyResults);

// @route   GET /api/student/profile
// @desc    Get student profile and statistics
// @access  Student only
router.get('/profile', protectStudent, getMyProfile);

// @route   GET /api/student/results/:id
// @desc    View specific result
// @access  Student only
router.get('/results/:id', protectStudent, viewResult);

module.exports = router;
