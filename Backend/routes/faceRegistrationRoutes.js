const express = require("express");
const router = express.Router();
const { protectTeacher } = require("../middleware/authMiddleware");
const {
  registerFace,
  getFaceStatus,
  getFaceDescriptor,
  updateFace
} = require("../controllers/faceRegistrationController");

// All routes require authentication
router.use(protectTeacher);

// Register face for a teacher
router.post("/register", registerFace);

// Get face registration status
router.get("/status", getFaceStatus);

// Get face descriptor for verification
router.get("/descriptor", getFaceDescriptor);

// Update/Re-register face
router.put("/update", updateFace);

module.exports = router;
