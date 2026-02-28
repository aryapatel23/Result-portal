const User = require('../models/User');

// Get standard mapping for promotion
const getNextStandard = (currentStandard) => {
  const standardMap = {
    '1': '2', '2': '3', '3': '4', '4': '5', '5': '6',
    '6': '7', '7': '8', '8': '9', '9': '10', '10': '11',
    '11': '12', '12': 'Graduated'
  };
  
  return standardMap[currentStandard.toString()] || currentStandard;
};

// Promote single student to next standard
const promoteSingleStudent = async (req, res) => {
  try {
    const { studentId, newStandard, toStandard } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    const student = await User.findOne({ _id: studentId, role: 'student' });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Save old standard before updating
    const oldStandard = student.standard;

    // If newStandard or toStandard provided, use it; otherwise auto-calculate
    const promotedStandard = newStandard || toStandard || getNextStandard(student.standard);

    student.standard = promotedStandard;
    await student.save();

    res.status(200).json({
      message: 'Student promoted successfully',
      student: {
        id: student._id,
        name: student.name,
        grNumber: student.grNumber,
        oldStandard: oldStandard,
        newStandard: promotedStandard
      }
    });

  } catch (error) {
    console.error('Student promotion error:', error);
    res.status(500).json({ message: 'Server error during promotion', error: error.message });
  }
};

// Bulk promote students by current standard
const bulkPromoteStudents = async (req, res) => {
  try {
    const { currentStandard, fromStandard, newStandard, toStandard, studentIds } = req.body;

    // Support both parameter naming conventions
    const standard = currentStandard || fromStandard;
    const targetStandard = newStandard || toStandard;

    if (!standard && !studentIds) {
      return res.status(400).json({ 
        message: 'Either current standard or student IDs are required' 
      });
    }

    let studentsToPromote;
    
    if (studentIds && studentIds.length > 0) {
      // Promote specific students by IDs
      studentsToPromote = await User.find({
        _id: { $in: studentIds },
        role: 'student'
      });
    } else {
      // Promote all students in a standard
      studentsToPromote = await User.find({
        standard: standard,
        role: 'student'
      });
    }

    if (studentsToPromote.length === 0) {
      return res.status(404).json({ message: 'No students found to promote' });
    }

    const promotionResults = {
      successful: [],
      failed: [],
      total: studentsToPromote.length
    };

    for (const student of studentsToPromote) {
      try {
        const oldStandard = student.standard;
        const promotedStandard = targetStandard || getNextStandard(student.standard);
        
        student.standard = promotedStandard;
        await student.save();

        promotionResults.successful.push({
          id: student._id,
          name: student.name,
          grNumber: student.grNumber,
          oldStandard: oldStandard,
          newStandard: promotedStandard
        });
      } catch (error) {
        promotionResults.failed.push({
          id: student._id,
          name: student.name,
          grNumber: student.grNumber,
          error: error.message
        });
      }
    }

    res.status(200).json({
      message: 'Bulk promotion completed',
      results: promotionResults
    });

  } catch (error) {
    console.error('Bulk promotion error:', error);
    res.status(500).json({ message: 'Server error during bulk promotion', error: error.message });
  }
};

// Get all students by standard
const getStudentsByStandard = async (req, res) => {
  try {
    const { standard } = req.params;

    if (!standard) {
      return res.status(400).json({ message: 'Standard parameter is required' });
    }

    console.log(`Fetching students for standard: ${standard}`);

    // Create regex pattern to match different formats: "9", "Grade 9", "STD 9", "Standard 9"
    const standardPattern = new RegExp(`(^${standard}$|grade\\s*${standard}|std\\s*${standard}|standard\\s*${standard})`, 'i');

    const students = await User.find({ 
      standard: standardPattern, 
      role: 'student' 
    }).select('_id name grNumber standard email').lean();

    console.log(`Found ${students.length} students in standard ${standard}`);
    if (students.length > 0) {
      console.log('Sample student:', students[0]);
    }

    res.status(200).json({
      total: students.length,
      students: students,
      standard: standard
    });

  } catch (error) {
    console.error('Error fetching students by standard:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  promoteSingleStudent,
  bulkPromoteStudents,
  getStudentsByStandard
};
