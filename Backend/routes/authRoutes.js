const express = require("express");
const router = express.Router();
const { loginUser, registerStudent, registerTeacher, forgotPassword, completePasswordReset } = require("../controllers/authController");
const {
  validateLogin,
  validateForgotPassword,
  validateChangePassword,
} = require("../middleware/validationMiddleware");
const {
  authLimiter,
  forgotPasswordLimiter,
} = require("../middleware/rateLimitMiddleware");

// Login route (Unified) with validation and rate limiting
router.post("/login", authLimiter, validateLogin, loginUser);

// Registration routes
router.post("/register/student", registerStudent);
router.post("/register/teacher", registerTeacher);

// Forgot password with validation (temporarily without rate limiting for debugging)
router.post("/forgot-password", validateForgotPassword, forgotPassword);

// Complete password reset (verify temp password + set new password)
router.post("/complete-password-reset", completePasswordReset);

module.exports = router;