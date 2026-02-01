const mongoose = require('mongoose');

const teacherAttendanceSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacherName: {
    type: String,
    required: true
  },
  employeeId: {
    type: String,
    default: 'N/A'
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Half Day', 'Leave'],
    required: true
  },
  checkInTime: {
    type: String,
    default: null
  },
  checkOutTime: {
    type: String,
    default: null
  },
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  faceImage: {
    type: String, // Base64 encoded image
    default: null
  },
  remarks: {
    type: String,
    default: ''
  },
  markedBy: {
    type: String,
    enum: ['self', 'admin'],
    default: 'self'
  },
  workingHours: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create compound index for teacher and date to prevent duplicate entries
teacherAttendanceSchema.index({ teacher: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('TeacherAttendance', teacherAttendanceSchema);
