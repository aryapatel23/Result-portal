const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
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
    type: String 
  },
  // Teacher-specific fields
  employeeId: { 
    type: String, 
    sparse: true // Only for teachers
  },
  subjects: [{ 
    type: String 
  }], // Subjects teacher handles
  classTeacher: {
    type: String, // The ONE class this teacher is class teacher of (e.g., "STD 9")
    default: null
  },
  assignedClasses: [{ 
    type: String 
  }], // All classes teacher teaches subjects in (includes classTeacher class)
  phone: { 
    type: String 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ grNumber: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model("User", userSchema);