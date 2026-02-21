const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Admin/Teacher Login
// Unified Login (Admin, Teacher, Student)
exports.loginUser = async (req, res) => {
  try {
    const { role, email, password, grNumber, dateOfBirth } = req.body;

    // --- STUDENT LOGIN ---
    if (role === 'student') {
      console.log(`Student Login Attempt: GR=${grNumber}, DOB=${dateOfBirth}`);

      if (!grNumber || !dateOfBirth) {
        return res.status(400).json({ message: "Please provide GR Number and Date of Birth" });
      }

      const student = await User.findOne({ grNumber, role: 'student' });
      if (!student) {
        console.log("Student not found");
        return res.status(401).json({ message: "Student not found with this GR Number" });
      }

      // Verify DOB
      // Backend received YYYY-MM-DD string
      const inputDOB = new Date(dateOfBirth).toISOString().split('T')[0];

      // Database has Date object
      const studentDOB = new Date(student.dateOfBirth).toISOString().split('T')[0];

      console.log(`Comparing DOB: Input=${inputDOB} vs Stored=${studentDOB}`);

      if (inputDOB !== studentDOB) {
        console.log("DOB Mismatch");
        return res.status(401).json({ message: "Invalid Date of Birth" });
      }

      // Generate token
      const token = jwt.sign(
        { id: student._id, role: 'student', name: student.name, grNumber: student.grNumber },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: student._id,
          name: student.name,
          role: 'student',
          grNumber: student.grNumber,
          standard: student.standard,
          email: student.email
        }
      });
    }

    // --- ADMIN / TEACHER LOGIN ---
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide Email and Password" });
    }

    console.log(`Staff Login Attempt: Email="${email}"`);

    const inputEmail = email.trim();
    const inputPass = password.trim();

    // DB Check for Teacher/Admin (Database Authentication Only)
    const user = await User.findOne({ email: inputEmail });
    if (!user) {
      console.log("User not found in DB");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log(`User Found: Role=${user.role}, Name=${user.name}`);

    if (user.role === 'student') {
      return res.status(401).json({ message: "Students must login with GR Number" });
    }

    const isMatch = await bcrypt.compare(inputPass, user.password);
    if (!isMatch) {
      console.log("Password Mismatch for Teacher/Staff");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        classTeacher: user.classTeacher,
        subjects: user.subjects,
        assignedClasses: user.assignedClasses
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// Student Registration (self-registration)
exports.registerStudent = async (req, res) => {
  try {
    const { name, grNumber, dateOfBirth, standard, email, phone } = req.body;

    if (!name || !grNumber || !dateOfBirth || !standard) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // Check if student already exists
    const existingStudent = await User.findOne({ grNumber });
    if (existingStudent) {
      return res.status(400).json({ message: "GR Number already registered" });
    }

    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
    }

    // Create student account (no password needed for students)
    const student = new User({
      name,
      grNumber,
      dateOfBirth: new Date(dateOfBirth),
      standard,
      email,
      phone,
      role: 'student',
      password: 'student123' // Placeholder, students login with GR + DOB
    });

    await student.save();

    res.status(201).json({
      message: "Student registered successfully! You can now login with your GR Number and Date of Birth.",
      student: {
        name: student.name,
        grNumber: student.grNumber,
        standard: student.standard
      }
    });
  } catch (error) {
    console.error("Student registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Teacher Registration (might be restricted to admin-only in production)
exports.registerTeacher = async (req, res) => {
  try {
    const { name, email, password, employeeId, subjects, assignedClasses, phone } = req.body;

    if (!name || !email || !password || !employeeId) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // Check if teacher already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create teacher account
    const teacher = new User({
      name,
      email,
      password: hashedPassword,
      role: 'teacher',
      employeeId,
      subjects: subjects || [],
      assignedClasses: assignedClasses || [],
      phone,
      isActive: true
    });

    await teacher.save();

    // Generate token
    const token = jwt.sign(
      {
        id: teacher._id,
        email: teacher.email,
        role: teacher.role,
        name: teacher.name,
        employeeId: teacher.employeeId
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Teacher registered successfully!",
      token,
      user: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        role: teacher.role,
        employeeId: teacher.employeeId
      }
    });
  } catch (error) {
    console.error("Teacher registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};