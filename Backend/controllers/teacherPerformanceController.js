const User = require('../models/User');
const Result = require('../models/Result');
const TeacherAttendance = require('../models/TeacherAttendance');
const TeacherPerformance = require('../models/Teacher');

/**
 * Calculate dynamic teacher performance based on actual data
 * Metrics include: Results, Student Performance, Attendance, Timeliness
 */
const calculateTeacherPerformance = async (teacherId) => {
  try {
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return null;
    }

    // 1. RESULT UPLOAD METRICS
    const allResults = await Result.find({ uploadedBy: teacherId });
    const totalResultsUploaded = allResults.length;

    // Current academic year results (format: 2024-25)
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    
    // Academic year typically runs Apr-Mar, so if month < 4, we're in previous year's academic year
    let academicYearStart = currentMonth < 4 ? currentYear - 1 : currentYear;
    let academicYearEnd = academicYearStart + 1;
    const academicYear = `${academicYearStart}-${String(academicYearEnd).slice(-2)}`;
    
    console.log(`📅 Detecting academic year for teacher ${teacher.name}:`, {
      currentDate: currentDate.toISOString().split('T')[0],
      academicYear,
      totalResults: allResults.length
    });
    
    // Use all results if no results match current year (for backward compatibility)
    let currentYearResults = allResults.filter(r => 
      r.academicYear === academicYear || 
      r.academicYear === `${academicYearStart-1}-${String(academicYearStart).slice(-2)}`
    );
    
    // Fallback to all results if filtering yields nothing
    if (currentYearResults.length === 0 && allResults.length > 0) {
      console.log(`⚠️  No results found for ${academicYear}, using all ${allResults.length} results`);
      currentYearResults = allResults;
    } else {
      console.log(`✅ Found ${currentYearResults.length} results for academic years: ${academicYear}, ${academicYearStart-1}-${String(academicYearStart).slice(-2)}`);
    }

    // 2. STUDENT PERFORMANCE METRICS
    let totalMarks = 0;
    let totalMaxMarks = 0;
    const uniqueStudents = new Set(); // Track unique students by grNumber
    const studentScores = {}; // Track each student's best/latest performance
    const subjectPerformance = {};

    currentYearResults.forEach(result => {
      // Count unique students by GR Number
      if (result.grNumber) {
        uniqueStudents.add(result.grNumber);
        
        // Calculate this result's percentage
        let studentTotal = 0;
        let studentMax = 0;
        
        result.subjects.forEach(subject => {
          studentTotal += subject.marks;
          studentMax += subject.maxMarks;
          totalMarks += subject.marks;
          totalMaxMarks += subject.maxMarks;

          // Track subject-wise performance
          if (!subjectPerformance[subject.name]) {
            subjectPerformance[subject.name] = {
              totalMarks: 0,
              totalMaxMarks: 0,
              count: 0
            };
          }
          subjectPerformance[subject.name].totalMarks += subject.marks;
          subjectPerformance[subject.name].totalMaxMarks += subject.maxMarks;
          subjectPerformance[subject.name].count++;
        });

        // Store student's score (keep highest if multiple results)
        const studentPercentage = studentMax > 0 ? (studentTotal / studentMax) * 100 : 0;
        if (!studentScores[result.grNumber] || studentScores[result.grNumber] < studentPercentage) {
          studentScores[result.grNumber] = studentPercentage;
        }
      }
    });

    const studentsCount = uniqueStudents.size; // Total unique students taught
    
    // Calculate pass count based on unique students (not results)
    let passCount = 0;
    Object.values(studentScores).forEach(percentage => {
      if (percentage >= 33) {
        passCount++;
      }
    });
    
    const classAveragePercentage = totalMaxMarks > 0 
      ? ((totalMarks / totalMaxMarks) * 100).toFixed(2)
      : 0;

    const passPercentage = studentsCount > 0
      ? ((passCount / studentsCount) * 100).toFixed(2)
      : 0;
    
    console.log(`👥 Student metrics for ${teacher.name}:`, {
      totalResults: currentYearResults.length,
      uniqueStudents: studentsCount,
      passCount,
      classAverage: classAveragePercentage,
      passPercentage
    });

    // Subject-wise breakdown
    const subjectWisePerformance = Object.keys(subjectPerformance).map(subject => {
      // Count unique students for this subject
      const subjectStudents = new Set();
      currentYearResults.forEach(result => {
        result.subjects.forEach(sub => {
          if (sub.name === subject && result.grNumber) {
            subjectStudents.add(result.grNumber);
          }
        });
      });
      
      return {
        subject,
        averagePercentage: subjectPerformance[subject].totalMaxMarks > 0
          ? ((subjectPerformance[subject].totalMarks / subjectPerformance[subject].totalMaxMarks) * 100).toFixed(2)
          : 0,
        totalStudents: subjectStudents.size
      };
    });

    // 3. ATTENDANCE METRICS
    const attendanceDocs = await TeacherAttendance.find({ teacher: teacherId });
    
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLeaves = 0;
    let totalHalfDays = 0;
    let totalDays = 0;

    attendanceDocs.forEach(doc => {
      totalPresent += doc.stats.present || 0;
      totalAbsent += doc.stats.absent || 0;
      totalLeaves += doc.stats.leaves || 0;
      totalHalfDays += doc.stats.halfDay || 0;
    });

    totalDays = totalPresent + totalAbsent + totalLeaves + totalHalfDays;
    const attendanceRate = totalDays > 0 
      ? ((totalPresent / totalDays) * 100).toFixed(2)
      : 0;

    // 4. UPLOAD FREQUENCY & TIMELINESS (Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUploads = allResults.filter(r => 
      new Date(r.createdAt) >= thirtyDaysAgo
    );

    // 5. WORKLOAD METRICS
    const uniqueStandards = [...new Set(currentYearResults.map(r => r.standard))];
    const classesHandled = teacher.assignedClasses?.length || uniqueStandards.length;

    // 6. CALCULATE OVERALL PERFORMANCE SCORE (out of 100)
    const weights = {
      resultsUploaded: 25,      // 25% weight
      studentPerformance: 30,    // 30% weight
      attendance: 25,            // 25% weight
      passRate: 20               // 20% weight
    };

    // Normalize scores
    const resultsScore = Math.min((totalResultsUploaded / 50) * weights.resultsUploaded, weights.resultsUploaded);
    const performanceScore = (parseFloat(classAveragePercentage) / 100) * weights.studentPerformance;
    const attendanceScore = (parseFloat(attendanceRate) / 100) * weights.attendance;
    const passRateScore = (parseFloat(passPercentage) / 100) * weights.passRate;

    const overallScore = (resultsScore + performanceScore + attendanceScore + passRateScore).toFixed(2);

    // 7. PERFORMANCE GRADE
    let performanceGrade = 'C';
    if (overallScore >= 90) performanceGrade = 'A+';
    else if (overallScore >= 80) performanceGrade = 'A';
    else if (overallScore >= 70) performanceGrade = 'B+';
    else if (overallScore >= 60) performanceGrade = 'B';
    else if (overallScore >= 50) performanceGrade = 'C';
    else performanceGrade = 'D';

    // 8. FIND TOP SCORER
    let topScorer = null;
    let maxPercentage = 0;

    currentYearResults.forEach(result => {
      const total = result.subjects.reduce((sum, s) => sum + s.marks, 0);
      const maxTotal = result.subjects.reduce((sum, s) => sum + s.maxMarks, 0);
      const percentage = maxTotal > 0 ? (total / maxTotal) * 100 : 0;

      if (percentage > maxPercentage) {
        maxPercentage = percentage;
        topScorer = {
          studentName: result.studentName,
          grNumber: result.grNumber,
          percentage: percentage.toFixed(2)
        };
      }
    });

    return {
      teacherId: teacher._id,
      teacherName: teacher.name,
      employeeId: teacher.employeeId,
      
      // Result Metrics
      totalResultsUploaded,
      recentUploads: recentUploads.length,
      
      // Student Performance
      totalStudentsTaught: studentsCount,
      classAveragePercentage: parseFloat(classAveragePercentage),
      passPercentage: parseFloat(passPercentage),
      topScorer,
      
      // Subject-wise
      subjectWisePerformance,
      subjectsHandled: teacher.subjects || [],
      
      // Workload
      classesHandled,
      assignedClasses: teacher.assignedClasses || [],
      
      // Attendance
      attendanceRate: parseFloat(attendanceRate),
      totalPresent,
      totalDays,
      
      // Overall Performance
      overallScore: parseFloat(overallScore),
      performanceGrade,
      
      // Breakdown
      performanceBreakdown: {
        resultsUploaded: {
          score: resultsScore.toFixed(2),
          weight: weights.resultsUploaded,
          actualValue: totalResultsUploaded
        },
        studentPerformance: {
          score: performanceScore.toFixed(2),
          weight: weights.studentPerformance,
          actualValue: classAveragePercentage
        },
        attendance: {
          score: attendanceScore.toFixed(2),
          weight: weights.attendance,
          actualValue: attendanceRate
        },
        passRate: {
          score: passRateScore.toFixed(2),
          weight: weights.passRate,
          actualValue: passPercentage
        }
      }
    };

  } catch (error) {
    console.error('Error calculating teacher performance:', error);
    return null;
  }
};

/**
 * Get performance for all teachers
 */
const getAllTeachersPerformance = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher', isActive: { $ne: false } });
    
    const performanceData = await Promise.all(
      teachers.map(async (teacher) => {
        const performance = await calculateTeacherPerformance(teacher._id);
        return performance;
      })
    );

    // Filter out null values and sort by overall score
    const validPerformance = performanceData
      .filter(p => p !== null)
      .sort((a, b) => b.overallScore - a.overallScore);

    res.json({
      success: true,
      count: validPerformance.length,
      teachers: validPerformance
    });

  } catch (error) {
    console.error('Error fetching teachers performance:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
};

/**
 * Get performance for a specific teacher
 */
const getTeacherPerformance = async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    const performance = await calculateTeacherPerformance(teacherId);
    
    if (!performance) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found or performance data unavailable'
      });
    }

    res.json({
      success: true,
      performance
    });

  } catch (error) {
    console.error('Error fetching teacher performance:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
};

/**
 * Get performance leaderboard (top performers)
 */
const getPerformanceLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const teachers = await User.find({ role: 'teacher', isActive: { $ne: false } });
    
    const performanceData = await Promise.all(
      teachers.map(async (teacher) => {
        const performance = await calculateTeacherPerformance(teacher._id);
        return performance;
      })
    );

    const leaderboard = performanceData
      .filter(p => p !== null)
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, limit)
      .map((p, index) => ({
        rank: index + 1,
        ...p
      }));

    res.json({
      success: true,
      leaderboard
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
};

module.exports = {
  getAllTeachersPerformance,
  getTeacherPerformance,
  getPerformanceLeaderboard,
  calculateTeacherPerformance // Export for use in other controllers
};
