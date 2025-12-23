const Result = require('../models/Result');
const User = require('../models/User');
const TeacherPerformance = require('../models/Teacher');

// Get teacher dashboard data
const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id;
    
    // Get teacher info
    const teacher = await User.findById(teacherId).select('-password');
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(403).json({ message: 'Not authorized as teacher' });
    }

    // Get results uploaded by this teacher
    const results = await Result.find({ uploadedBy: teacherId });
    
    // Calculate statistics
    const totalStudents = results.length;
    const classesTaught = [...new Set(results.map(r => r.standard))];
    
    // Calculate average performance
    let totalPercentage = 0;
    results.forEach(result => {
      const totalMarks = result.subjects.reduce((sum, sub) => sum + sub.marks, 0);
      const totalMax = result.subjects.reduce((sum, sub) => sum + sub.maxMarks, 0);
      totalPercentage += (totalMarks / totalMax) * 100;
    });
    const avgPercentage = totalStudents > 0 ? (totalPercentage / totalStudents).toFixed(2) : 0;

    // Recent uploads
    const recentResults = await Result.find({ uploadedBy: teacherId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('studentName grNumber standard createdAt');

    res.status(200).json({
      teacher: {
        name: teacher.name,
        email: teacher.email,
        employeeId: teacher.employeeId,
        subjects: teacher.subjects,
        classTeacher: teacher.classTeacher, // The class they're class teacher of
        assignedClasses: teacher.assignedClasses // All classes they teach in
      },
      statistics: {
        totalStudents,
        classesTaught: classesTaught.length,
        classes: classesTaught,
        averagePercentage: avgPercentage
      },
      recentResults
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

    // Check if teacher is class teacher of this class
    const teacher = await User.findById(teacherId);
    console.log('👨‍🏫 Teacher details:', { 
      name: teacher?.name, 
      classTeacher: teacher?.classTeacher, 
      role: teacher?.role 
    });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Allow admins to upload for any class, teachers only for their class
    if (teacher.role === 'teacher' && teacher.classTeacher !== standard) {
      return res.status(403).json({ 
        message: `You can only upload results for your class teacher class: ${teacher.classTeacher || 'None assigned'}. Trying to upload for: ${standard}` 
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
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
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
