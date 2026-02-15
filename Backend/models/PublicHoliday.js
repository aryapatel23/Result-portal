const mongoose = require('mongoose');

const publicHolidaySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  isRecurring: {
    type: Boolean,
    default: false,
    comment: 'If true, this holiday repeats annually (e.g., Independence Day)'
  },
  createdBy: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    comment: 'Can be ObjectId for regular users or string for admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient date queries
publicHolidaySchema.index({ date: 1 });

// Update the updatedAt timestamp before saving
publicHolidaySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to check if a date is a holiday
publicHolidaySchema.statics.isHoliday = async function(date) {
  try {
    // Create date range for the entire day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Check for exact date match
    const holiday = await this.findOne({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });
    
    if (holiday) {
      return { isHoliday: true, holiday };
    }
    
    // Check for recurring holidays (same month and day)
    const month = date.getMonth();
    const day = date.getDate();
    
    const recurringHoliday = await this.findOne({
      isRecurring: true
    });
    
    if (recurringHoliday) {
      const holidayDate = new Date(recurringHoliday.date);
      if (holidayDate.getMonth() === month && holidayDate.getDate() === day) {
        return { isHoliday: true, holiday: recurringHoliday };
      }
    }
    
    return { isHoliday: false, holiday: null };
  } catch (error) {
    console.error('Error checking holiday:', error);
    return { isHoliday: false, holiday: null };
  }
};

// Static method to get all holidays for a year
publicHolidaySchema.statics.getYearHolidays = async function(year) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);
  
  return await this.find({
    $or: [
      {
        date: {
          $gte: startDate,
          $lte: endDate
        }
      },
      {
        isRecurring: true
      }
    ]
  }).sort({ date: 1 });
};

// Static method to get upcoming holidays
publicHolidaySchema.statics.getUpcomingHolidays = async function(limit = 5) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return await this.find({
    date: {
      $gte: today
    }
  })
  .sort({ date: 1 })
  .limit(limit)
  .populate('createdBy', 'name email');
};

module.exports = mongoose.model('PublicHoliday', publicHolidaySchema);
