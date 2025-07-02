const express = require('express');
const router = express.Router();

const { uploadResult, getAllResultsForAdmin, deleteResult } = require('../controllers/resultController');
const { getStudentResult } = require('../controllers/fetchResultController');

// Route to upload result
router.post('/', uploadResult);

// Route for student to fetch their result by GR number and DOB
router.get('/', getStudentResult);

// Route for admin to get results filtered by standard
router.get('/admin', getAllResultsForAdmin);

router.delete('/:id', deleteResult);

module.exports = router;