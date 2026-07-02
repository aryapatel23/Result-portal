const mongoose = require("mongoose");
const { normalizeStandard } = require('../utils/standardFormatter');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true // Allows null/missing values for students while keeping it unique for others
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["admin", "teacher", "student"],
    default: "student"
  },
  // Student-specific fields
  grNumber: {
    type: String,
    sparse: true, // Only for students
    unique: true
  },
  dateOfBirth: {
    type: Date
  },
  standard: {
    type: String,
    set: normalizeStandard
  },
  penNo: {
    type: String,
    sparse: true // Only for students
  },
  aadharNumber: {
    type: String,
    sparse: true // Only for students
  },
  childUID: {
    type: String,
    sparse: true // Only for students
  },
  mobile: {
    type: String
  },
  parentContact: {
    type: String
  },
  // Teacher-specific fields
  employeeId: {
    type: String,
    sparse: true // Only for teachers
  },
  subjects: [{
    type: String
  }], // Subjects teacher handles — auto-derived from teachingAssignments via pre-save hook
  classTeacher: {
    type: String, // The ONE class this teacher is class teacher of (e.g., "STD-3")
    set: normalizeStandard,
    default: null
  },
  assignedClasses: [{
    type: String
  }], // All classes teacher teaches subjects in — auto-derived from teachingAssignments
  // Explicit mapping: which subject the teacher teaches in which class
  teachingAssignments: [{
    standard: {
      type: String,
      set: normalizeStandard
    },
    subject: {
      type: String,
      trim: true
    }
  }],
  phone: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Face recognition data (for teachers)
  faceDescriptor: {
    type: [Number], // Array of facial feature numbers from face-api.js
    default: null
  },
  referenceFaceImage: {
    type: String, // Base64 encoded reference photo
    default: null
  },
  faceRegistered: {
    type: Boolean,
    default: false
  },
  // Password reset flag
  passwordResetRequired: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// ─── Pre-save hook ────────────────────────────────────────────────────────────
// When a teacher has teachingAssignments defined, automatically keep the legacy
// assignedClasses and subjects arrays in sync so all existing queries work.
userSchema.pre('save', function (next) {
  if (this.role === 'teacher' && this.teachingAssignments && this.teachingAssignments.length > 0) {
    // Build a unique set of normalized standards from the teaching assignments
    const classSet = new Set(this.teachingAssignments.map(ta => normalizeStandard(ta.standard)));
    // Always include the classTeacher class in assignedClasses
    if (this.classTeacher) classSet.add(normalizeStandard(this.classTeacher));
    this.assignedClasses = Array.from(classSet).filter(Boolean);

    // Build a unique set of subjects
    const subjectSet = new Set(this.teachingAssignments.map(ta => ta.subject).filter(Boolean));
    this.subjects = Array.from(subjectSet);
  } else if (this.role === 'teacher' && this.classTeacher) {
    // Even with no explicit assignments, ensure classTeacher is in assignedClasses
    const normalized = normalizeStandard(this.classTeacher);
    if (normalized && !this.assignedClasses.includes(normalized)) {
      this.assignedClasses.push(normalized);
    }
  }
  next();
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ grNumber: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'teachingAssignments.standard': 1 });

module.exports = mongoose.model("User", userSchema);