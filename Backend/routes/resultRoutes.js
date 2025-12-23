const express = require('express');
const router = express.Router();

const { 
  uploadResult, 
  getAllResultsForAdmin, 
  deleteResult,
  updateResult,
  getResultById
} = require('../controllers/resultController');

const { getStudentResult } = require('../controllers/fetchResultController');
const { protectTeacher, protectAdmin } = require('../middleware/authMiddleware');

// Route to upload result (Teacher or Admin only)
router.post('/', protectTeacher, uploadResult);

// Route for student to fetch their result by GR number and DOB (public)
router.get('/', getStudentResult);

// Route for admin to get results filtered by standard
router.get('/admin', protectTeacher, getAllResultsForAdmin);

router.get('/:id', protectTeacher, getResultById);

// Route for admin to update result by ID
router.put('/:id', protectTeacher, updateResult);

// Route for admin to delete result
router.delete('/:id', protectTeacher, deleteResult);

module.exports = router;
