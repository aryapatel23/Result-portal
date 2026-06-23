const mongoose = require('mongoose');
const { normalizeStandard } = require('../utils/standardFormatter');

const studentSchema = new mongoose.Schema({
  studentName: String,
  grNumber: String,
  dateOfBirth: String,
  standard: {
    type: String,
    set: normalizeStandard
  },
  subjects: [
    {
      name: String,
      marks: Number,
      maxMarks: Number
    }
  ],
  totalMarks: Number,
  totalMaxMarks: Number,
  percentage: Number,
  remarks: String
});

module.exports = mongoose.model('Student', studentSchema);