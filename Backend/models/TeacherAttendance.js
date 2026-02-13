const mongoose = require('mongoose');


const teacherAttendanceSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: String, // Format: "MM-YYYY" (e.g., "02-2026")
    required: true
  },
  year: {
    type: Number,
    required: true
  },

  // Array of Daily Records
  records: [{
    date: { type: Date, required: true }, // ISO Date
    day: { type: Number, required: true }, // 1-31
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Half-Day', 'Leave'],
      required: true
    },
    checkInTime: { type: String, default: null },
    checkOutTime: { type: String, default: null },
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    faceImage: { type: String, default: null },
    remarks: { type: String, default: '' },
    markedBy: { type: String, enum: ['self', 'admin'], default: 'self' },
    workingHours: { type: Number, default: 0 }
  }],

  // Aggregated Stats for the Month (for quick dashboards)
  stats: {
    present: { type: Number, default: 0 },
    absent: { type: Number, default: 0 },
    leaves: { type: Number, default: 0 },
    halfDay: { type: Number, default: 0 },
    late: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Create compound index: One document per teacher per month
teacherAttendanceSchema.index({ teacher: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('TeacherAttendance', teacherAttendanceSchema);
