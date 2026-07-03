const User = require('../models/User');
const Result = require('../models/Result');
const TeacherPerformance = require('../models/Teacher');
const bcrypt = require('bcryptjs');
const { sendTeacherWelcomeEmail, sendEmailUpdateNotification } = require('../utils/emailService');

// Get all staff (teachers + admins) with performance overview
const getAllTeachers = async (req, res) => {
  try {
    const { activeOnly, role } = req.query;

    // By default, return both teachers and admins for the staff management panel
    // Pass ?role=teacher to get only teachers (e.g. for attendance)
    const query = role
      ? { role }
      : { role: { $in: ['teacher', 'admin'] } };

    if (activeOnly === 'true') {
      query.isActive = { $ne: false };
    }

    const teachers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    // Get performance data for each teacher (admins will just have 0 results)
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
    console.error('Error fetching staff:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get detailed staff profile (teacher or admin)
const getTeacherPerformance = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { academicYear, term } = req.query;

    const teacher = await User.findById(teacherId).select('-password');
    if (!teacher || !['teacher', 'admin'].includes(teacher.role)) {
      return res.status(404).json({ message: 'Staff member not found' });
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
        teachingAssignments: teacher.teachingAssignments || [],
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

// Generate a random 6-character alphanumeric password
const generatePassword = (length = 6) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Create a new staff account (teacher or admin)
const createTeacher = async (req, res) => {
  try {
    const {
      name, email, employeeId, phone,
      role,                    // 'teacher' (default) | 'admin'
      // Teacher-specific
      subjects, classTeacher, assignedClasses, teachingAssignments
    } = req.body;

    if (!name || !email || !employeeId) {
      return res.status(400).json({ message: 'Please fill all required fields (Name, Email, Employee ID)' });
    }

    // Only 'teacher' and 'admin' roles can be created via this endpoint
    const assignedRole = role === 'admin' ? 'admin' : 'teacher';

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Auto-generate a 6-character password
    const plainPassword = generatePassword(6);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // Build the document — teacher-specific fields only apply to teachers
    const userData = {
      name,
      email,
      password: hashedPassword,
      role: assignedRole,
      employeeId,
      phone,
      isActive: true,
      passwordResetRequired: true  // Force password change on first login
    };

    if (assignedRole === 'teacher') {
      userData.subjects = subjects || [];
      userData.classTeacher = classTeacher || null;
      userData.assignedClasses = assignedClasses || [];
      userData.teachingAssignments = teachingAssignments || [];
    }

    const teacher = new User(userData);
    await teacher.save(); // pre-save hook derives assignedClasses + subjects from teachingAssignments

    // Send welcome email with auto-generated credentials
    let emailSent = false;
    try {
      await sendTeacherWelcomeEmail({
        email: teacher.email,
        name: teacher.name,
        password: plainPassword,
        employeeId: teacher.employeeId,
        role: assignedRole
      });
      emailSent = true;
      console.log(`✅ Welcome email with credentials sent to ${teacher.email} [role: ${assignedRole}]`);
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError);
    }

    const roleLabel = assignedRole === 'admin' ? 'Admin' : 'Teacher';
    res.status(201).json({
      message: `${roleLabel} account created successfully! ${emailSent ? 'Login credentials sent to ' + teacher.email : 'Warning: Email could not be sent. Auto-generated password: ' + plainPassword}`,
      emailSent,
      role: assignedRole,
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        role: teacher.role,
        employeeId: teacher.employeeId,
        classTeacher: teacher.classTeacher || null
      }
    });
  } catch (error) {
    console.error('Error creating staff account:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update teacher details
const updateTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const updates = req.body;

    // Fetch the teacher document to update (so pre-save hooks fire on .save())
    const originalTeacher = await User.findById(teacherId);
    if (!originalTeacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Track changes for email notification
    const emailChanged = updates.email && updates.email !== originalTeacher.email;
    const passwordChanged = updates.password && updates.password.trim() !== '';
    const originalPassword = updates.password;

    // Apply scalar updates (role change never allowed)
    if (updates.name !== undefined) originalTeacher.name = updates.name;
    if (updates.email !== undefined) originalTeacher.email = updates.email;
    if (updates.phone !== undefined) originalTeacher.phone = updates.phone;
    if (updates.isActive !== undefined) originalTeacher.isActive = updates.isActive;
    if (updates.classTeacher !== undefined) originalTeacher.classTeacher = updates.classTeacher || null;

    // Update teachingAssignments — pre-save hook will rebuild assignedClasses + subjects
    if (updates.teachingAssignments !== undefined) {
      originalTeacher.teachingAssignments = updates.teachingAssignments;
    }

    // Fallback: if no teachingAssignments but explicit arrays sent, use them directly
    if (updates.teachingAssignments === undefined) {
      if (updates.subjects !== undefined) originalTeacher.subjects = updates.subjects;
      if (updates.assignedClasses !== undefined) originalTeacher.assignedClasses = updates.assignedClasses;
    }

    // Hash password if being changed
    if (passwordChanged) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      originalTeacher.password = await bcrypt.hash(updates.password, salt);
    }

    // .save() triggers the pre-save hook to sync assignedClasses + subjects
    await originalTeacher.save();
    const teacher = await User.findById(teacherId).select('-password');

    // Send email notification if email or password was changed
    if (emailChanged || passwordChanged) {
      try {
        await sendEmailUpdateNotification({
          email: teacher.email,
          name: teacher.name,
          password: passwordChanged ? originalPassword : null,
          employeeId: teacher.employeeId
        });
        console.log(`✅ Update notification sent to ${teacher.email}`);
      } catch (emailError) {
        console.error('❌ Failed to send update notification:', emailError);
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
