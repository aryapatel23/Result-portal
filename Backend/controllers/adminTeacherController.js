const User = require('../models/User');
const Result = require('../models/Result');
const TeacherPerformance = require('../models/Teacher');
const bcrypt = require('bcryptjs');
const { sendTeacherWelcomeEmail, sendEmailUpdateNotification } = require('../utils/emailService');

// Get all teachers with performance overview
const getAllTeachers = async (req, res) => {
  try {
    // Support filtering by active status for attendance operations
    const { activeOnly } = req.query;
    const query = { role: 'teacher' };
    
    // Filter for active teachers only if requested
    if (activeOnly === 'true') {
      query.isActive = { $ne: false };
    }
    
    const teachers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    // Get performance data for each teacher
    const teachersWithPerformance = await Promise.all(
      teachers.map(async (teacher) => {
        const results = await Result.find({ uploadedBy: teacher._id });
        const latestPerformance = await TeacherPerformance.findOne({
          teacherId: teacher._id
        }).sort({ createdAt: -1 });

        return {
          ...teacher.toObject(),
          totalResultsUploaded: results.length,
          latestPerformance: latestPerformance?.metrics || null
        };
      })
    );

    res.status(200).json(teachersWithPerformance);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get detailed teacher performance
const getTeacherPerformance = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { academicYear, term } = req.query;

    const teacher = await User.findById(teacherId).select('-password');
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Get all performance records
    let query = { teacherId };
    if (academicYear) query.academicYear = academicYear;
    if (term) query.term = term;

    const performanceRecords = await TeacherPerformance.find(query)
      .sort({ createdAt: -1 });

    // Get all results uploaded by teacher
    const results = await Result.find({ uploadedBy: teacherId })
      .sort({ createdAt: -1 });

    // Calculate overall statistics
    const totalStudents = results.length;
    const classesTaught = [...new Set(results.map(r => r.standard))];

    let totalPercentage = 0;
    let passCount = 0;
    results.forEach(result => {
      const totalMarks = result.subjects.reduce((sum, sub) => sum + sub.marks, 0);
      const totalMax = result.subjects.reduce((sum, sub) => sum + sub.maxMarks, 0);
      const percentage = (totalMarks / totalMax) * 100;
      totalPercentage += percentage;
      if (percentage >= 35) passCount++;
    });

    const overallAverage = totalStudents > 0 ? (totalPercentage / totalStudents).toFixed(2) : 0;
    const passPercentage = totalStudents > 0 ? ((passCount / totalStudents) * 100).toFixed(2) : 0;

    res.status(200).json({
      teacher: {
        name: teacher.name,
        email: teacher.email,
        employeeId: teacher.employeeId,
        subjects: teacher.subjects,
        classTeacher: teacher.classTeacher,
        assignedClasses: teacher.assignedClasses,
        isActive: teacher.isActive
      },
      overallStatistics: {
        totalStudents,
        classesTaught: classesTaught.length,
        classes: classesTaught,
        overallAverage,
        passPercentage
      },
      performanceRecords,
      recentResults: results.slice(0, 10)
    });
  } catch (error) {
    console.error('Error fetching teacher performance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new teacher account
const createTeacher = async (req, res) => {
  try {
    const { name, email, password, employeeId, subjects, classTeacher, assignedClasses, phone } = req.body;

    if (!name || !email || !password || !employeeId) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    // Check if teacher already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const teacher = new User({
      name,
      email,
      password: hashedPassword,
      role: 'teacher',
      employeeId,
      subjects: subjects || [],
      classTeacher: classTeacher || null,
      assignedClasses: assignedClasses || [],
      phone,
      isActive: true
    });

    await teacher.save();

    // Send welcome email with credentials
    try {
      await sendTeacherWelcomeEmail({
        email: teacher.email,
        name: teacher.name,
        password: password, // Send the original password (before hashing)
        employeeId: teacher.employeeId
      });
      console.log(`✅ Welcome email sent to ${teacher.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError);
      // Don't fail the request if email fails - teacher is already created
    }

    res.status(201).json({
      message: 'Teacher account created successfully',
      emailSent: true, // Indicate email was attempted
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        employeeId: teacher.employeeId,
        classTeacher: teacher.classTeacher
      }
    });
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update teacher details
const updateTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const updates = req.body;

    // Get the original teacher data before update
    const originalTeacher = await User.findById(teacherId);
    if (!originalTeacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Check if email is being changed
    const emailChanged = updates.email && updates.email !== originalTeacher.email;
    const passwordChanged = updates.password && updates.password.trim() !== '';
    const originalPassword = updates.password; // Store before hashing

    // Don't allow role change through this endpoint
    delete updates.role;

    // If password is being updated, hash it
    if (passwordChanged) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const teacher = await User.findByIdAndUpdate(
      teacherId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Send email notification if email or password was changed
    if (emailChanged || passwordChanged) {
      try {
        await sendEmailUpdateNotification({
          email: teacher.email, // Use new email
          name: teacher.name,
          password: passwordChanged ? originalPassword : null, // Send original password if changed
          employeeId: teacher.employeeId
        });
        console.log(`✅ Update notification sent to ${teacher.email}`);
      } catch (emailError) {
        console.error('❌ Failed to send update notification:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.status(200).json({
      message: 'Teacher updated successfully',
      emailSent: emailChanged || passwordChanged,
      teacher
    });
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete/Deactivate teacher
const deleteTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { permanent } = req.query; // ?permanent=true to permanently delete

    if (permanent === 'true') {
      await User.findByIdAndDelete(teacherId);
      res.status(200).json({ message: 'Teacher permanently deleted' });
    } else {
      // Just deactivate
      const teacher = await User.findByIdAndUpdate(
        teacherId,
        { isActive: false },
        { new: true }
      ).select('-password');

      res.status(200).json({
        message: 'Teacher deactivated',
        teacher
      });
    }
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Rate teacher performance
const rateTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { rating, comments, term, academicYear } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    let performance = await TeacherPerformance.findOne({
      teacherId,
      term: term || 'Term-1',
      academicYear: academicYear || '2024-25'
    });

    if (!performance) {
      // Create new performance record if doesn't exist
      performance = new TeacherPerformance({
        teacherId,
        term: term || 'Term-1',
        academicYear: academicYear || '2024-25',
        metrics: {}
      });
    }

    performance.ratings = {
      adminRating: rating,
      comments: comments || '',
      lastReviewedBy: req.user.id,
      lastReviewedAt: new Date()
    };

    await performance.save();

    res.status(200).json({
      message: 'Teacher rated successfully',
      performance
    });
  } catch (error) {
    console.error('Error rating teacher:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get admin dashboard with overview
const getAdminDashboard = async (req, res) => {
  try {
    console.log('📊 Fetching Admin Dashboard Data...');

    // Total counts
    const [totalStudents, totalTeachers, totalResults] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher', isActive: true }),
      Result.countDocuments()
    ]);

    console.log(`📈 Counts - Students: ${totalStudents}, Teachers: ${totalTeachers}, Results: ${totalResults}`);

    // Recent activities (populate uploadedBy carefully)
    const recentResults = await Result.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('uploadedBy', 'name role email');

    console.log('🔄 Recent results fetched');

    // Teacher performance summary (fetch only active teachers)
    const teachers = await User.find({ role: 'teacher', isActive: true }).select('name employeeId');
    console.log(`👨‍🏫 Processing stats for ${teachers.length} teachers`);

    const teacherStats = await Promise.all(
      teachers.map(async (teacher) => {
        try {
          const [resultsCount, latestPerf] = await Promise.all([
            Result.countDocuments({ uploadedBy: teacher._id }),
            TeacherPerformance.findOne({ teacherId: teacher._id }).sort({ createdAt: -1 })
          ]);

          return {
            teacherId: teacher._id,
            name: teacher.name,
            employeeId: teacher.employeeId,
            resultsUploaded: resultsCount,
            rating: latestPerf?.ratings?.adminRating || 0,
            classAverage: latestPerf?.metrics?.classAveragePercentage || 0
          };
        } catch (innerError) {
          console.error(`❌ Error fetching stats for teacher ${teacher.name}:`, innerError.message);
          return {
            teacherId: teacher._id,
            name: teacher.name,
            employeeId: teacher.employeeId,
            resultsUploaded: 0,
            rating: 0,
            classAverage: 0
          };
        }
      })
    );

    // Sort teachers by performance
    teacherStats.sort((a, b) => b.classAverage - a.classAverage);
    console.log('✅ Admin dashboard data prepared');

    res.status(200).json({
      overview: {
        totalStudents,
        totalTeachers,
        totalResults
      },
      recentResults: recentResults || [],
      topTeachers: teacherStats.slice(0, 5),
      allTeachers: teacherStats
    });
  } catch (error) {
    console.error('❌ Error fetching admin dashboard:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create student account
const createStudent = async (req, res) => {
  try {
    const { name, grNumber, dateOfBirth, standard, email, phone } = req.body;

    if (!name || !grNumber || !dateOfBirth || !standard) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const existingStudent = await User.findOne({ grNumber });
    if (existingStudent) {
      return res.status(400).json({ message: 'GR Number already exists' });
    }

    const student = new User({
      name,
      grNumber,
      dateOfBirth: new Date(dateOfBirth),
      standard,
      email,
      phone,
      role: 'student',
      password: 'student123' // Default password, should be changed
    });

    await student.save();

    res.status(201).json({
      message: 'Student account created successfully',
      student: {
        id: student._id,
        name: student.name,
        grNumber: student.grNumber,
        standard: student.standard
      }
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get results upload activity by teachers
const getResultsActivity = async (req, res) => {
  try {
    // Aggregate results by teacher
    const activity = await Result.aggregate([
      {
        $match: {
          uploadedBy: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: "$uploadedBy",
          totalUploads: { $sum: 1 },
          lastUploadDate: { $max: "$createdAt" },
          standards: { $addToSet: "$standard" },
          terms: { $addToSet: "$term" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "teacher"
        }
      },
      {
        $unwind: "$teacher"
      },
      {
        $project: {
          teacherId: "$_id",
          teacherName: "$teacher.name",
          employeeId: "$teacher.employeeId",
          email: "$teacher.email",
          totalUploads: 1,
          lastUploadDate: 1,
          standardsCount: { $size: "$standards" },
          termsCount: { $size: "$terms" }
        }
      },
      {
        $sort: { totalUploads: -1 }
      }
    ]);

    res.json({ activity });
  } catch (error) {
    console.error('Error fetching results activity:', error);
    res.status(500).json({ message: 'Failed to fetch results activity', error: error.message });
  }
};

module.exports = {
  getAllTeachers,
  getTeacherPerformance,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  rateTeacher,
  getAdminDashboard,
  createStudent,
  getResultsActivity
};
