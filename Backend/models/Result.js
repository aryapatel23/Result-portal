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
    required: true
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
  // Track who uploaded this result
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedByRole: {
    type: String,
    enum: ['admin', 'teacher']
  },
  // Academic tracking
  academicYear: {
    type: String,
    default: '2024-25'
  },
  term: {
    type: String,
    enum: ['Term-1', 'Term-2', 'Mid-term', 'Final'],
    default: 'Term-1'
  },
  examType: {
    type: String,
    default: 'ANNUAL EXAMINATION'
  },
  // Status tracking
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Compound unique index: Same student can have multiple results for different terms
// But cannot have duplicate results for the same term
resultSchema.index({ grNumber: 1, term: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);