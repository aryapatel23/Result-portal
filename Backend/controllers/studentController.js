const User = require('../models/User');
const Result = require('../models/Result');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Student login
const studentLogin = async (req, res) => {
  try {
    const { grNumber, dateOfBirth } = req.body;

    if (!grNumber || !dateOfBirth) {
      return res.status(400).json({ message: 'GR Number and Date of Birth are required' });
    }

    // Find student by GR number and DOB
    console.log(`🔍 Student login attempt - GR: ${grNumber}, DOB: ${dateOfBirth}`);

    // Normalize date to search
    const searchDate = new Date(dateOfBirth);
    searchDate.setHours(0, 0, 0, 0);

    const student = await User.findOne({
      grNumber,
      dateOfBirth: {
        $gte: searchDate,
        $lt: new Date(searchDate.getTime() + 24 * 60 * 60 * 1000)
      },
      role: 'student'
    });

    if (!student) {
      console.log(`❌ No student found with GR: ${grNumber} and DOB: ${dateOfBirth}`);
      // Try finding by GR only to see if it exists
      const grOnly = await User.findOne({ grNumber, role: 'student' });
      if (grOnly) {
        console.log(`💡 Student found with GR ${grNumber} but DOB mismatch. DB DOB: ${grOnly.dateOfBirth}`);
      }
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`✅ Student login successful: ${student.name}`);

    // Generate token
    const token = jwt.sign(
      {
        id: student._id,
        role: student.role,
        grNumber: student.grNumber,
        name: student.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        id: student._id,
        name: student.name,
        grNumber: student.grNumber,
        standard: student.standard,
        role: student.role
      }
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get student's own results
const getMyResults = async (req, res) => {
  try {
    const grNumber = req.user.grNumber;

    const results = await Result.find({ grNumber })
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name employeeId');

    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'No results found' });
    }

    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching student results:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get student profile
const getMyProfile = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).select('-password');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get result statistics
    const results = await Result.find({ grNumber: student.grNumber });

    let avgPercentage = 0;
    if (results.length > 0) {
      let totalPercentage = 0;
      results.forEach(result => {
        const totalMarks = result.subjects.reduce((sum, sub) => sum + sub.marks, 0);
        const totalMax = result.subjects.reduce((sum, sub) => sum + sub.maxMarks, 0);
        totalPercentage += (totalMarks / totalMax) * 100;
      });
      avgPercentage = (totalPercentage / results.length).toFixed(2);
    }

    res.status(200).json({
      student: {
        name: student.name,
        grNumber: student.grNumber,
        standard: student.standard,
        dateOfBirth: student.dateOfBirth,
        email: student.email
      },
      statistics: {
        totalExamsTaken: results.length,
        averagePercentage: avgPercentage
      }
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// View specific result
const viewResult = async (req, res) => {
  try {
    const { id } = req.params;
    const grNumber = req.user.grNumber;

    const result = await Result.findOne({ _id: id, grNumber })
      .populate('uploadedBy', 'name employeeId');

    if (!result) {
      return res.status(404).json({ message: 'Result not found or access denied' });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching result:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Public endpoint to view latest result without login
const viewLatestResult = async (req, res) => {
  try {
    const { grNumber, dateOfBirth } = req.query;

    if (!grNumber || !dateOfBirth) {
      return res.status(400).json({ message: 'GR Number and Date of Birth are required' });
    }

    // Verify student exists with matching credentials
    const student = await User.findOne({
      grNumber,
      dateOfBirth: new Date(dateOfBirth),
      role: 'student'
    });

    if (!student) {
      return res.status(404).json({ message: 'No student found with these credentials' });
    }

    // Find latest result for this student
    const result = await Result.findOne({ grNumber })
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name employeeId');

    if (!result) {
      return res.status(404).json({ message: 'No results found for this student' });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching latest result:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get student info by GR Number (for auto-fill in result upload)
const getStudentByGR = async (req, res) => {
  try {
    const { grNumber } = req.params;

    if (!grNumber) {
      return res.status(400).json({ message: 'GR Number is required' });
    }

    const student = await User.findOne({ grNumber, role: 'student' })
      .select('name grNumber dateOfBirth standard parentContact');

    if (!student) {
      return res.status(404).json({ message: 'Student not found with this GR Number' });
    }

    res.status(200).json({ student });
  } catch (error) {
    console.error('Error fetching student by GR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  studentLogin,
  getMyResults,
  getMyProfile,
  viewResult,
  viewLatestResult,
  getStudentByGR
};
