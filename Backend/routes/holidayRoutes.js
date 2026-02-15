const express = require('express');
const router = express.Router();
const {
  createHoliday,
  getAllHolidays,
  getUpcomingHolidays,
  getHolidayById,
  updateHoliday,
  deleteHoliday,
  checkHoliday
} = require('../controllers/holidayController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Apply admin protection to all routes
router.use(protectAdmin);

// Routes
router.route('/')
  .get(getAllHolidays)
  .post(createHoliday);

router.get('/upcoming', getUpcomingHolidays);
router.post('/check', checkHoliday);

router.route('/:id')
  .get(getHolidayById)
  .put(updateHoliday)
  .delete(deleteHoliday);

module.exports = router;
