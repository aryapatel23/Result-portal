const express = require("express");
const router = express.Router();
const { getResult, getStudentByGR } = require("../controllers/userController");

// Student views result using query: /view?grNumber=GR001&standard=10
router.get("/view", getResult);

// Get student info by GR Number
router.get("/student/:grNumber", getStudentByGR);

module.exports = router;