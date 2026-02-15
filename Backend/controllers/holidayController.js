const PublicHoliday = require('../models/PublicHoliday');

// @desc    Create a new public holiday
// @route   POST /api/admin/holidays
// @access  Admin
exports.createHoliday = async (req, res) => {
  try {
    const { date, name, description, isRecurring } = req.body;

    if (!date || !name) {
      return res.status(400).json({
        success: false,
        message: 'Date and name are required'
      });
    }

    // Check if holiday already exists for this date
    const holidayDate = new Date(date);
    holidayDate.setHours(0, 0, 0, 0);

    const existingHoliday = await PublicHoliday.findOne({
      date: {
        $gte: holidayDate,
        $lte: new Date(holidayDate.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (existingHoliday) {
      return res.status(400).json({
        success: false,
        message: 'A holiday already exists for this date'
      });
    }

    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login as admin.'
      });
    }

    const holiday = await PublicHoliday.create({
      date: holidayDate,
      name: name.trim(),
      description: description?.trim() || '',
      isRecurring: isRecurring === true,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Holiday created successfully',
      holiday
    });
  } catch (error) {
    console.error('Create holiday error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      user: req.user ? 'authenticated' : 'not authenticated',
      body: req.body
    });
    res.status(500).json({
      success: false,
      message: 'Failed to create holiday',
      error: error.message
    });
  }
};

// @desc    Get all holidays
// @route   GET /api/admin/holidays
// @access  Admin
exports.getAllHolidays = async (req, res) => {
  try {
    const { year } = req.query;

    let holidays;
    if (year) {
      holidays = await PublicHoliday.getYearHolidays(parseInt(year));
    } else {
      holidays = await PublicHoliday.find()
        .sort({ date: 1 })
        .populate('createdBy', 'name email');
    }

    res.json({
      success: true,
      count: holidays.length,
      holidays
    });
  } catch (error) {
    console.error('Get holidays error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch holidays',
      error: error.message
    });
  }
};

// @desc    Get upcoming holidays
// @route   GET /api/admin/holidays/upcoming
// @access  Admin
exports.getUpcomingHolidays = async (req, res) => {
  try {
    const { limit } = req.query;
    const holidays = await PublicHoliday.getUpcomingHolidays(
      limit ? parseInt(limit) : 5
    );

    res.json({
      success: true,
      count: holidays.length,
      holidays
    });
  } catch (error) {
    console.error('Get upcoming holidays error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming holidays',
      error: error.message
    });
  }
};

// @desc    Get holiday by ID
// @route   GET /api/admin/holidays/:id
// @access  Admin
exports.getHolidayById = async (req, res) => {
  try {
    const holiday = await PublicHoliday.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found'
      });
    }

    res.json({
      success: true,
      holiday
    });
  } catch (error) {
    console.error('Get holiday error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch holiday',
      error: error.message
    });
  }
};

// @desc    Update a holiday
// @route   PUT /api/admin/holidays/:id
// @access  Admin
exports.updateHoliday = async (req, res) => {
  try {
    const { date, name, description, isRecurring } = req.body;

    const holiday = await PublicHoliday.findById(req.params.id);

    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found'
      });
    }

    // Update fields
    if (date) {
      const newDate = new Date(date);
      newDate.setHours(0, 0, 0, 0);
      holiday.date = newDate;
    }
    if (name) holiday.name = name.trim();
    if (description !== undefined) holiday.description = description.trim();
    if (isRecurring !== undefined) holiday.isRecurring = isRecurring;

    await holiday.save();

    res.json({
      success: true,
      message: 'Holiday updated successfully',
      holiday
    });
  } catch (error) {
    console.error('Update holiday error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update holiday',
      error: error.message
    });
  }
};

// @desc    Delete a holiday
// @route   DELETE /api/admin/holidays/:id
// @access  Admin
exports.deleteHoliday = async (req, res) => {
  try {
    const holiday = await PublicHoliday.findById(req.params.id);

    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found'
      });
    }

    await holiday.deleteOne();

    res.json({
      success: true,
      message: 'Holiday deleted successfully'
    });
  } catch (error) {
    console.error('Delete holiday error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete holiday',
      error: error.message
    });
  }
};

// @desc    Check if a date is a holiday
// @route   POST /api/admin/holidays/check
// @access  Admin
exports.checkHoliday = async (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    const checkDate = new Date(date);
    const result = await PublicHoliday.isHoliday(checkDate);

    res.json({
      success: true,
      date: checkDate,
      isHoliday: result.isHoliday,
      holiday: result.holiday
    });
  } catch (error) {
    console.error('Check holiday error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check holiday',
      error: error.message
    });
  }
};
