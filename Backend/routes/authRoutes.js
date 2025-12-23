const express = require("express");
const router = express.Router();
const { loginAdmin, registerStudent, registerTeacher } = require("../controllers/authController");

// Login route (for admin and teachers)
router.post("/login", loginAdmin);

// Registration routes
router.post("/register/student", registerStudent);
router.post("/register/teacher", registerTeacher);

module.exports = router;