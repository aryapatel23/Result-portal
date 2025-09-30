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

// Route to upload result
router.post('/', uploadResult);

// Route for student to fetch their result by GR number and DOB
router.get('/', getStudentResult);

// Route for admin to get results filtered by standard
router.get('/admin', getAllResultsForAdmin);

router.get('/:id', getResultById);


// Route for admin to update result by ID
router.put('/:id', updateResult);

// Route for admin to delete result
router.delete('/:id', deleteResult);

module.exports = router;
