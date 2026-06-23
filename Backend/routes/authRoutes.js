const express = require("express");
const router = express.Router();
const { loginUser, registerStudent, registerTeacher, forgotPassword, completePasswordReset } = require("../controllers/authController");
const {
  validateLogin,
  validateForgotPassword,
  validateChangePassword,
} = require("../middleware/validationMiddleware");

// Login route (Unified) with validation
router.post("/login", validateLogin, loginUser);

// Registration routes
router.post("/register/student", registerStudent);
router.post("/register/teacher", registerTeacher);

// Forgot password with validation
router.post("/forgot-password", validateForgotPassword, forgotPassword);

// Complete password reset (verify temp password + set new password)
router.post("/complete-password-reset", completePasswordReset);

module.exports = router;