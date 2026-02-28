const express = require("express");
const router = express.Router();
const { loginUser, registerStudent, registerTeacher, forgotPassword, completePasswordReset } = require("../controllers/authController");

// Login route (Unified)
router.post("/login", loginUser);

// Registration routes
router.post("/register/student", registerStudent);
router.post("/register/teacher", registerTeacher);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Complete password reset (verify temp password + set new password)
router.post("/complete-password-reset", completePasswordReset);

module.exports = router;