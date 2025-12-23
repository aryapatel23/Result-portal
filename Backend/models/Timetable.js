const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
  timeSlot: { 
    type: String, 
    required: true // e.g., "08:00 - 09:00"
  },
  startTime: {
    type: String,
    default: '' // e.g., "08:00"
  },
  endTime: {
    type: String,
    default: '' // e.g., "09:00"
  },
  subject: { 
    type: String, 
    required: true 
  },
  class: { 
    type: String, 
    required: true // e.g., "STD 9"
  },
  room: { 
    type: String, 
    default: '' // Optional room number
  }
});

const timetableSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  academicYear: {
    type: String,
    default: '2024-25'
  },
  schedule: {
    Monday: [periodSchema],
    Tuesday: [periodSchema],
    Wednesday: [periodSchema],
    Thursday: [periodSchema],
    Friday: [periodSchema],
    Saturday: [periodSchema]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Admin who created it
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Ensure one timetable per teacher per academic year
timetableSchema.index({ teacher: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);
