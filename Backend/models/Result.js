const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  marks: { type: Number, required: true },
  maxMarks: { type: Number, required: true }
});

const resultSchema = new mongoose.Schema({
  studentName: { 
    type: String, 
    required: true 
  },
  grNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  dateOfBirth: { 
    type: Date, 
    required: true 
  },
  standard: { 
    type: String, 
    required: true 
  },
  subjects: [subjectSchema],
  remarks: { 
    type: String 
  },
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);
