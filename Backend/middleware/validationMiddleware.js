const { body, param, query, validationResult } = require('express-validator');

/**
 * 🔍 Input Validation Middleware
 * Validates and sanitizes all user inputs
 */

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn('⚠️  Validation failed:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Login validation
const validateLogin = [
  body('role')
    .trim()
    .isIn(['admin', 'teacher', 'student'])
    .withMessage('Invalid role'),
  
  body('email')
    .if(body('role').not().equals('student'))
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  
  body('password')
    .if(body('role').not().equals('student'))
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  body('grNumber')
    .if(body('role').equals('student'))
    .trim()
    .notEmpty()
    .withMessage('GR Number is required for students'),
  
  body('dateOfBirth')
    .if(body('role').equals('student'))
    .isISO8601()
    .withMessage('Invalid date of birth format'),
  
  handleValidationErrors
];

// Forgot password validation
const validateForgotPassword = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  handleValidationErrors
];

// Change password validation
const validateChangePassword = [
  body('oldPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Passwords do not match'),
  
  handleValidationErrors
];

// Create teacher validation
const validateCreateTeacher = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be 10 digits'),
  
  body('subjects')
    .optional()
    .isArray()
    .withMessage('Subjects must be an array'),
  
  handleValidationErrors
];

// Create student validation
const validateCreateStudent = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('grNumber')
    .trim()
    .notEmpty()
    .withMessage('GR Number is required')
    .isLength({ min: 2, max: 20 })
    .withMessage('GR Number must be between 2 and 20 characters'),
  
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Invalid date of birth format'),
  
  body('standard')
    .trim()
    .notEmpty()
    .withMessage('Standard is required'),
  
  body('rollNumber')
    .optional()
    .isNumeric()
    .withMessage('Roll number must be numeric'),
  
  body('fatherName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Father name too long'),
  
  body('motherName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Mother name too long'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be 10 digits'),
  
  handleValidationErrors
];

// Result validation
const validateCreateResult = [
  body('studentId')
    .trim()
    .notEmpty()
    .withMessage('Student ID is required')
    .isMongoId()
    .withMessage('Invalid student ID'),
  
  body('term')
    .trim()
    .isIn(['Term 1', 'Term 2', 'Final'])
    .withMessage('Invalid term'),
  
  body('subjects')
    .isArray({ min: 1 })
    .withMessage('At least one subject is required'),
  
  body('subjects.*.subject')
    .trim()
    .notEmpty()
    .withMessage('Subject name is required'),
  
  body('subjects.*.marks')
    .isNumeric()
    .withMessage('Marks must be numeric')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Marks must be between 0 and 100'),
  
  handleValidationErrors
];

// Attendance validation
const validateAttendance = [
  body('date')
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('status')
    .isIn(['present', 'absent', 'late', 'half-day'])
    .withMessage('Invalid attendance status'),
  
  handleValidationErrors
];

// ID parameter validation
const validateMongoId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  handleValidationErrors
];

// Search/filter validation
const validateSearchQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .isIn(['name', 'date', 'marks', 'standard', '-name', '-date', '-marks', '-standard'])
    .withMessage('Invalid sort field'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateLogin,
  validateForgotPassword,
  validateChangePassword,
  validateCreateTeacher,
  validateCreateStudent,
  validateCreateResult,
  validateAttendance,
  validateMongoId,
  validateSearchQuery,
};
