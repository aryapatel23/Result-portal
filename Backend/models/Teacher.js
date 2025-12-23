const mongoose = require('mongoose');

const teacherPerformanceSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  term: {
    type: String,
    enum: ['Term-1', 'Term-2', 'Mid-term', 'Final'],
    required: true
  },
  metrics: {
    totalResultsUploaded: {
      type: Number,
      default: 0
    },
    totalStudentsTaught: {
      type: Number,
      default: 0
    },
    classAveragePercentage: {
      type: Number,
      default: 0
    },
    passPercentage: {
      type: Number,
      default: 0 // % of students passing
    },
    topScorer: {
      studentName: String,
      marks: Number,
      grNumber: String
    },
    subjectWisePerformance: [{
      subject: String,
      averageMarks: Number,
      totalStudents: Number
    }]
  },
  uploadHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    resultCount: Number,
    standard: String
  }],
  ratings: {
    adminRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    comments: String,
    lastReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastReviewedAt: Date
  }
}, { timestamps: true });

// Index for efficient queries
teacherPerformanceSchema.index({ teacherId: 1, academicYear: 1, term: 1 });

module.exports = mongoose.model('TeacherPerformance', teacherPerformanceSchema);
