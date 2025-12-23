const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protectAdmin, protectTeacher } = require('../middleware/authMiddleware');
const {
  bulkUploadStudents,
  downloadTemplate,
  registerSingleStudent
} = require('../controllers/bulkStudentController');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `students_${Date.now()}${path.extname(file.originalname)}`);
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
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

// @route   POST /api/bulk-students/upload
// @desc    Bulk upload students via Excel
// @access  Admin and Teacher
router.post('/upload', protectTeacher, upload.single('file'), bulkUploadStudents);

// @route   POST /api/bulk-students/register
// @desc    Register single student
// @access  Admin and Teacher
router.post('/register', protectTeacher, registerSingleStudent);

// @route   GET /api/bulk-students/template
// @desc    Download Excel template for bulk upload
// @access  Admin and Teacher
router.get('/template', protectTeacher, downloadTemplate);

module.exports = router;
