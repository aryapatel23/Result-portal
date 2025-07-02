const express = require("express");
const router = express.Router();
const { uploadResult, exportResults } = require("../controllers/adminController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

router.post("/upload", authenticate, authorize("admin"), uploadResult);
router.get("/export", authenticate, authorize("admin"), exportResults);

module.exports = router;