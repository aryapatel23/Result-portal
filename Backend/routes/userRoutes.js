const express = require("express");
const router = express.Router();
const { getResult } = require("../controllers/userController");

// Student views result using query: /view?grNumber=GR001&standard=10
router.get("/view", getResult);

module.exports = router;
