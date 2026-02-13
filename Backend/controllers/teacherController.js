const Result = require('../models/Result');
const User = require('../models/User');
const TeacherPerformance = require('../models/Teacher');
const Timetable = require('../models/Timetable');
const mongoose = require('mongoose');

// Get teacher dashboard data
const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Get teacher info
    const teacher = await User.findById(teacherId).select('-password');
    if (!teacher || (teacher.role !== 'teacher' && teacher.role !== 'admin')) {
      return res.status(403).json({ message: 'Not authorized as teacher' });
    }

    // Get results uploaded by this teacher
    const results = await Result.find({ uploadedBy: teacherId });

    // Calculate statistics
    const studentCount = await User.countDocuments({
      role: 'student',
      standard: { $in: [teacher.classTeacher, ...(teacher.assignedClasses || [])].filter(Boolean) }
    });

    const classesTaught = [...new Set([teacher.classTeacher, ...(teacher.assignedClasses || [])].filter(Boolean))];

    // Calculate average performance
    let totalPercentage = 0;
    results.forEach(result => {
      const totalMarks = result.subjects.reduce((sum, sub) => sum + sub.marks, 0);
      const totalMax = result.subjects.reduce((sum, sub) => sum + sub.maxMarks, 0);
      if (totalMax > 0) totalPercentage += (totalMarks / totalMax) * 100;
    });
    const avgPercentage = results.length > 0 ? (totalPercentage / results.length).toFixed(2) : 0;

    // Recent uploads
    const recentResults = await Result.find({ uploadedBy: teacherId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('studentName grNumber standard createdAt');

    // Get Next Class from Timetable
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    let nextClass = null;

    if (today !== 'Sunday') {
      const timetable = await Timetable.findOne({ teacher: teacherId });
      if (timetable && timetable.schedule && timetable.schedule[today]) {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Find next class in today's schedule
        const upcoming = timetable.schedule[today]
          .filter(p => p.startTime > currentTime)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));

        if (upcoming.length > 0) {
          nextClass = upcoming[0];
        }
      }
    }

    // Calculate leave stats
    const SystemConfig = require('../models/SystemConfig');
    const TeacherAttendance = require('../models/TeacherAttendance');

    const config = await SystemConfig.findOne({ key: 'default_config' });
    const yearlyLimit = config ? config.yearlyLeaveLimit : 12;

    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const endOfYear = new Date(new Date().getFullYear(), 11, 31);

    const leavesTakenAgg = await TeacherAttendance.aggregate([
      { $match: { teacher: new mongoose.Types.ObjectId(teacherId) } },
      { $unwind: "$records" },
      {
        $match: {
          "records.status": "Leave",
          "records.date": { $gte: startOfYear, $lte: endOfYear }
        }
      },
      { $count: "count" }
    ]);

    const leavesTaken = leavesTakenAgg.length > 0 ? leavesTakenAgg[0].count : 0;

    res.status(200).json({
      teacher: {
        name: teacher.name,
        email: teacher.email,
        employeeId: teacher.employeeId,
        subjects: teacher.subjects,
        classTeacher: teacher.classTeacher,
        assignedClasses: teacher.assignedClasses
      },
      statistics: {
        totalStudents: studentCount,
        classesTaught: classesTaught.length,
        classes: classesTaught,
        averagePercentage: avgPercentage,
        leavesTaken,
        yearlyLeaveLimit: yearlyLimit
      },
      recentResults,
      nextClass
    });
  } catch (error) {
    console.error('Error fetching teacher dashboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload result by teacher
const uploadResultByTeacher = async (req, res) => {
  try {
    const { studentName, grNumber, dateOfBirth, standard, subjects, remarks, term, academicYear } = req.body;
    const teacherId = req.user.id;

    console.log('📝 Upload request received:', { studentName, grNumber, standard, term, academicYear });
    console.log('👤 Teacher ID:', teacherId);

    if (!studentName || !grNumber || !dateOfBirth || !standard || !subjects || !subjects.length) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    // Check teacher details
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Allow admins to upload for any class
    // Teachers can upload for their classTeacher class OR any class in assignedClasses
    const allowedClasses = new Set();
    if (teacher.classTeacher) allowedClasses.add(teacher.classTeacher);
    if (teacher.assignedClasses) teacher.assignedClasses.forEach(c => allowedClasses.add(c));

    if (teacher.role === 'teacher' && !allowedClasses.has(standard)) {
      console.log(`❌ Permission denied for class: ${standard}. Allowed:`, Array.from(allowedClasses));
      return res.status(403).json({
        message: `You are not authorized to upload results for ${standard}. You can only upload for: ${Array.from(allowedClasses).join(', ') || 'None assigned'}`
      });
    }

    const existingResult = await Result.findOne({ grNumber, term, academicYear });
    if (existingResult) {
      return res.status(400).json({
        message: `Result for GR Number ${grNumber} already exists for this term (${term})`
      });
    }

    const newResult = new Result({
      studentName,
      grNumber,
      dateOfBirth,
      standard,
      subjects,
      remarks,
      term: term || 'Term-1',
      academicYear: academicYear || '2024-25',
      uploadedBy: teacherId,
      uploadedByRole: teacher.role || 'teacher'
    });

    await newResult.save();
    console.log('✅ Result saved successfully');

    // Update teacher performance metrics
    await updateTeacherPerformance(teacherId, standard, term, academicYear);

    res.status(201).json({
      message: 'Result uploaded successfully',
      result: newResult
    });
  } catch (error) {
    console.error('❌ Error uploading result:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get results uploaded by teacher
const getMyResults = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { standard, term } = req.query;

    let query = { uploadedBy: teacherId };
    if (standard) query.standard = standard;
    if (term) query.term = term;

    const results = await Result.find(query)
      .sort({ createdAt: -1 });

    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single result by ID (only if uploaded by this teacher)
const getResultById = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    const result = await Result.findById(id);
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    // Check if teacher uploaded this result
    if (result.uploadedBy.toString() !== teacherId) {
      return res.status(403).json({
        message: 'You can only view results you uploaded'
      });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching result:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Edit result (only if uploaded by this teacher)
const editResult = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;
    const updates = req.body;

    const result = await Result.findById(id);
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    // Check if teacher uploaded this result
    if (result.uploadedBy.toString() !== teacherId) {
      return res.status(403).json({
        message: 'You can only edit results you uploaded'
      });
    }

    Object.assign(result, updates);
    result.lastModifiedBy = teacherId;
    await result.save();

    res.status(200).json({
      message: 'Result updated successfully',
      result
    });
  } catch (error) {
    console.error('Error updating result:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete result (only if uploaded by this teacher)
const deleteResult = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    const result = await Result.findById(id);
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    if (result.uploadedBy.toString() !== teacherId) {
      return res.status(403).json({
        message: 'You can only delete results you uploaded'
      });
    }

    await Result.findByIdAndDelete(id);
    res.status(200).json({ message: 'Result deleted successfully' });
  } catch (error) {
    console.error('Error deleting result:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get teacher's performance stats
const getMyPerformance = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { academicYear, term } = req.query;

    let query = { teacherId };
    if (academicYear) query.academicYear = academicYear;
    if (term) query.term = term;

    const performance = await TeacherPerformance.find(query)
      .sort({ createdAt: -1 });

    res.status(200).json(performance);
  } catch (error) {
    console.error('Error fetching performance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to update teacher performance
const updateTeacherPerformance = async (teacherId, standard, term, academicYear) => {
  try {
    let performance = await TeacherPerformance.findOne({
      teacherId,
      term,
      academicYear
    });

    if (!performance) {
      performance = new TeacherPerformance({
        teacherId,
        term,
        academicYear: academicYear || '2024-25',
        metrics: {
          totalResultsUploaded: 0,
          totalStudentsTaught: 0,
          classAveragePercentage: 0,
          passPercentage: 0,
          subjectWisePerformance: []
        },
        uploadHistory: []
      });
    }

    // Update metrics
    const results = await Result.find({ uploadedBy: teacherId, term, academicYear });
    performance.metrics.totalResultsUploaded = results.length;
    performance.metrics.totalStudentsTaught = results.length;

    // Calculate class average
    let totalPercentage = 0;
    let passCount = 0;
    results.forEach(result => {
      const totalMarks = result.subjects.reduce((sum, sub) => sum + sub.marks, 0);
      const totalMax = result.subjects.reduce((sum, sub) => sum + sub.maxMarks, 0);
      const percentage = (totalMarks / totalMax) * 100;
      totalPercentage += percentage;
      if (percentage >= 35) passCount++; // Assuming 35% is passing
    });

    performance.metrics.classAveragePercentage = results.length > 0
      ? (totalPercentage / results.length).toFixed(2)
      : 0;
    performance.metrics.passPercentage = results.length > 0
      ? ((passCount / results.length) * 100).toFixed(2)
      : 0;

    // Add to upload history
    performance.uploadHistory.push({
      date: new Date(),
      resultCount: 1,
      standard
    });

    await performance.save();
  } catch (error) {
    console.error('Error updating teacher performance:', error);
  }
};

module.exports = {
  getTeacherDashboard,
  uploadResultByTeacher,
  getMyResults,
  getResultById,
  editResult,
  deleteResult,
  getMyPerformance
};
