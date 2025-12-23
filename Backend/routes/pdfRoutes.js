const express = require('express');
const router = express.Router();
const { protectTeacher } = require('../middleware/authMiddleware');
const {
  generateReportCard,
  generateLatestResultPDF,
  generateResultPDFById
} = require('../controllers/pdfController');

// @route   GET /api/pdf/report-card/:grNumber
// @desc    Generate full report card PDF
// @access  Teacher/Admin
router.get('/report-card/:grNumber', protectTeacher, generateReportCard);

// @route   GET /api/pdf/latest-result/:grNumber
// @desc    Generate PDF for latest result (public access for students)
// @access  Public
router.get('/latest-result/:grNumber', generateLatestResultPDF);

// @route   GET /api/pdf/result/:resultId
// @desc    Generate PDF for specific result by ID
// @access  Public/Student
router.get('/result/:resultId', generateResultPDFById);

module.exports = router;
