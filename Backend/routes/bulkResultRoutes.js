const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protectTeacher } = require('../middleware/authMiddleware');
const {
  bulkUploadResults,
  downloadResultTemplate
} = require('../controllers/bulkResultController');

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `results_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

// @route   POST /api/bulk-results/upload
// @desc    Bulk upload results via Excel
// @access  Teacher
router.post('/upload', protectTeacher, upload.single('file'), bulkUploadResults);

// @route   GET /api/bulk-results/template
// @desc    Download Excel template for bulk result upload
// @access  Teacher
router.get('/template', protectTeacher, downloadResultTemplate);

module.exports = router;
