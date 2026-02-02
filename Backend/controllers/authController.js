const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Admin/Teacher Login
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for hardcoded admin
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(
        { email, role: "admin", name: "Admin" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        message: "Login successful",
        token,
        user: {
          email,
          role: "admin",
          name: "Admin"
        }
      });
    }

    // Check database for teacher/admin
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account has been deactivated. Please contact the administrator for assistance."
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        employeeId: user.employeeId
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        subjects: user.subjects,
        assignedClasses: user.assignedClasses
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
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