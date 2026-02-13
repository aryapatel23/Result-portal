const express = require('express');
const router = express.Router();
const { getConfig, updateConfig } = require('../controllers/systemConfigController');
const { protect } = require('../middleware/authMiddleware');
// Assuming we have an admin middleware, if not we check role in controller or use protect
// For now using protect, and usually admin check is separate or inside controller?
// Let's use the standard middleware if available.
const { protectAdmin } = require('../middleware/authMiddleware');

router.get('/', getConfig);
router.put('/', protectAdmin, updateConfig);

module.exports = router;
