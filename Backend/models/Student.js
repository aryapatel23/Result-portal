const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentName: String,
  grNumber: String,
  dateOfBirth: String,
  standard: String,
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
