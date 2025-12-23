const User = require('../models/User');
const Result = require('../models/Result');
const { formatStandard } = require('../utils/standardFormatter');

// @desc    Get all students with pagination and filters
// @route   GET /api/student-management
// @access  Teacher/Admin
exports.getAllStudents = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      standard = '', 
      sortBy = 'name',
      sortOrder = 'asc' 
    } = req.query;

    const query = { role: 'student' };

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { grNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Standard filter with flexible matching
    if (standard) {
      query.standard = {
        $regex: new RegExp(`^${standard}$|grade\\s*${standard}|std\\s*${standard}|standard\\s*${standard}`, 'i')
      };
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const students = await User.find(query)
      .select('-password')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await User.countDocuments(query);

    // Get result count for each student
    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const resultCount = await Result.countDocuments({ 
          grNumber: student.grNumber 
        });
        return {
          ...student,
          resultCount
        };
      })
    );

    res.json({
      success: true,
      students: studentsWithStats,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get student by ID
// @route   GET /api/student-management/:id
// @access  Teacher/Admin
exports.getStudentById = async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-password');
    
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get all results for this student
    const results = await Result.find({ grNumber: student.grNumber })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      student,
      results
    });
  } catch (error) {
    console.error('Get student by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update student
// @route   PUT /api/student-management/:id
// @access  Teacher/Admin
exports.updateStudent = async (req, res) => {
  try {
    const { name, email, dob, dateOfBirth, standard, parentContact } = req.body;
    
    const student = await User.findById(req.params.id);
    
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update fields
    if (name) student.name = name;
    if (email) student.email = email;
    if (dob || dateOfBirth) student.dateOfBirth = dob || dateOfBirth;
    if (standard) student.standard = standard;
    if (parentContact) student.parentContact = parentContact;

    await student.save();

    res.json({
      success: true,
      message: 'Student updated successfully',
      student: {
        _id: student._id,
        name: student.name,
        grNumber: student.grNumber,
        email: student.email,
        dob: student.dob,
        standard: student.standard,
        parentContact: student.parentContact
      }
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete student
// @route   DELETE /api/student-management/:id
// @access  Teacher/Admin
exports.deleteStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete all results associated with this student
    await Result.deleteMany({ grNumber: student.grNumber });

    // Delete the student
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Student and associated results deleted successfully'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Bulk delete students
// @route   POST /api/student-management/bulk-delete
// @access  Teacher/Admin
exports.bulkDeleteStudents = async (req, res) => {
  try {
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'Please provide student IDs to delete' });
    }

    // Get all students to delete
    const students = await User.find({
      _id: { $in: studentIds },
      role: 'student'
    });

    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found to delete' });
    }

    // Get all GR numbers
    const grNumbers = students.map(s => s.grNumber);

    // Delete all results for these students
    const resultDeleteCount = await Result.deleteMany({ 
      grNumber: { $in: grNumbers } 
    });

    // Delete all students
    const studentDeleteResult = await User.deleteMany({
      _id: { $in: studentIds },
      role: 'student'
    });

    res.json({
      success: true,
      message: `Successfully deleted ${studentDeleteResult.deletedCount} students and ${resultDeleteCount.deletedCount} results`,
      deleted: {
        students: studentDeleteResult.deletedCount,
        results: resultDeleteCount.deletedCount
      }
    });
  } catch (error) {
    console.error('Bulk delete students error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get student statistics
// @route   GET /api/student-management/stats/overview
// @access  Teacher/Admin
exports.getStudentStats = async (req, res) => {
  try {
    // Total students
    const totalStudents = await User.countDocuments({ role: 'student' });

    // Students by standard
    const studentsByStandard = await User.aggregate([
      { $match: { role: 'student' } },
      { 
        $group: { 
          _id: '$standard', 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = await User.countDocuments({
      role: 'student',
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Students with email vs without
    const studentsWithEmail = await User.countDocuments({
      role: 'student',
      email: { $exists: true, $ne: '' }
    });

    res.json({
      success: true,
      stats: {
        totalStudents,
        recentRegistrations,
        studentsWithEmail,
        studentsWithoutEmail: totalStudents - studentsWithEmail,
        byStandard: studentsByStandard
      }
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Export students to Excel
// @route   GET /api/student-management/export
// @access  Teacher/Admin
exports.exportStudents = async (req, res) => {
  try {
    const XLSX = require('xlsx');
    const { search = '', standard = '' } = req.query;

    const query = { role: 'student' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { grNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (standard) {
      query.standard = {
        $regex: new RegExp(`^${standard}$|grade\\s*${standard}|std\\s*${standard}|standard\\s*${standard}`, 'i')
      };
    }

    const students = await User.find(query)
      .select('-password')
      .sort({ standard: 1, name: 1 })
      .lean();

    // Get result count for each student
    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const resultCount = await Result.countDocuments({ 
          grNumber: student.grNumber 
        });
        return {
          'GR Number': student.grNumber,
          'Name': student.name,
          'Standard': formatStandard(student.standard),
          'Email': student.email || '',
          'Date of Birth': student.dob ? new Date(student.dob).toLocaleDateString() : '',
          'Parent Contact': student.parentContact || '',
          'Results Count': resultCount,
          'Registered On': new Date(student.createdAt).toLocaleDateString()
        };
      })
    );

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(studentsWithStats);

    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // GR Number
      { wch: 25 }, // Name
      { wch: 12 }, // Standard
      { wch: 30 }, // Email
      { wch: 15 }, // DOB
      { wch: 15 }, // Parent Contact
      { wch: 12 }, // Results Count
      { wch: 15 }  // Registered On
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Students');

    // Generate buffer
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Students_Export_${Date.now()}.xlsx`);
    res.send(excelBuffer);
  } catch (error) {
    console.error('Export students error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
