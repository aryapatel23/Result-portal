const express = require("express");
const router = express.Router();
const { loginUser, registerStudent, registerTeacher } = require("../controllers/authController");

// Login route (Unified)
router.post("/login", loginUser);

// Registration routes
router.post("/register/student", registerStudent);
router.post("/register/teacher", registerTeacher);

module.exports = router;