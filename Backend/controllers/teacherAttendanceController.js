const TeacherAttendance = require('../models/TeacherAttendance');
const User = require('../models/User');
const { verifyLocation } = require('../utils/locationUtils');

// Mark attendance (Teacher)
exports.markAttendance = async (req, res) => {
  try {
    const { status, location, remarks } = req.body;
    const teacherId = req.user.id || req.user._id;

    if (!teacherId) {
      console.log('❌ Controller: No user ID in request');
      return res.status(401).json({ message: 'User ID missing from token' });
    }

    // Get teacher details
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      console.log('❌ Controller: User not found in DB:', teacherId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('👥 Controller: User Role from DB:', teacher.role);

    if (teacher.role !== 'teacher' && teacher.role !== 'admin') {
      console.log('❌ Controller: Access denied for role:', teacher.role);
      return res.status(403).json({ message: `Access denied. Your role is ${teacher.role}.` });
    }

    // Check if attendance already marked today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAttendance = await TeacherAttendance.findOne({
      teacher: teacherId,
      date: { $gte: today, $lt: tomorrow }
    });

    if (existingAttendance) {
      return res.status(400).json({
        message: 'Attendance already marked for today',
        attendance: existingAttendance
      });
    }

    let locationCheck = null;
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    // Time restrictions
    const PRESENT_CUTOFF = 11 * 60; // 11:00 AM
    const HALF_DAY_CUTOFF = 14 * 60 + 30; // 2:30 PM

    // Validate time restrictions based on status
    if (status === 'Present' && currentTimeInMinutes >= PRESENT_CUTOFF) {
      return res.status(400).json({
        message: 'Present attendance must be marked before 11:00 AM',
        currentTime: currentTime.toLocaleTimeString()
      });
    }

    if (status === 'Half Day' && currentTimeInMinutes >= HALF_DAY_CUTOFF) {
      return res.status(400).json({
        message: 'Half Day attendance must be marked before 2:30 PM',
        currentTime: currentTime.toLocaleTimeString()
      });
    }

    // Skip location verification for "Leave" status
    if (status !== 'Leave') {
      // Validate location (using environment variables)
      if (!location || !location.latitude || !location.longitude) {
        return res.status(400).json({ message: 'Location is required for Present and Half Day status' });
      }

      // Verify location using utility function
      locationCheck = verifyLocation(location.latitude, location.longitude);

      if (!locationCheck.isValid) {
        return res.status(400).json({
          message: locationCheck.message,
          distance: locationCheck.distance,
          allowedRadius: parseFloat(process.env.ATTENDANCE_RADIUS_KM)
        });
      }

      console.log(`✅ Location verified: ${locationCheck.message}`);
    } else {
      console.log('📝 Status is Leave: Skipping location verification');
    }

    console.log(`📝 Marking attendance - Status: ${status}, Teacher: ${teacher.name}`);

    // Create attendance record
    const checkInTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const attendance = new TeacherAttendance({
      teacher: teacherId,
      teacherName: teacher.name,
      employeeId: teacher.employeeId || 'N/A',
      date: today,
      status: status || 'Present',
      checkInTime,
      location: location ? {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || (status !== 'Leave' && locationCheck ? `${locationCheck.distance.toFixed(2)} km from school` : 'N/A')
      } : {
        latitude: 0,
        longitude: 0,
        address: 'N/A'
      },
      remarks: remarks || '',
      markedBy: 'self'
    });

    await attendance.save();

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance,
      distance: locationCheck ? locationCheck.distance : 'N/A'
    });

  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get today's attendance status (Teacher)
exports.getTodayStatus = async (req, res) => {
  try {
    const teacherId = req.user.id || req.user._id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await TeacherAttendance.findOne({
      teacher: teacherId,
      date: { $gte: today, $lt: tomorrow }
    });

    res.json({
      marked: !!attendance,
      attendance: attendance || null
    });

  } catch (error) {
    console.error('Error getting today status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get my attendance history (Teacher)
exports.getMyHistory = async (req, res) => {
  try {
    const teacherId = req.user.id || req.user._id;
    const { month, year, startDate, endDate } = req.query;

    let query = { teacher: teacherId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      query.date = { $gte: start, $lte: end };
    }

    const attendance = await TeacherAttendance.find(query).sort({ date: -1 });

    // Calculate statistics
    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'Present').length,
      absent: attendance.filter(a => a.status === 'Absent').length,
      halfDay: attendance.filter(a => a.status === 'Half-Day').length,
      leave: attendance.filter(a => a.status === 'Leave').length,
      percentage: attendance.length > 0
        ? ((attendance.filter(a => a.status === 'Present').length / attendance.length) * 100).toFixed(2)
        : 0
    };

    res.json({
      attendance,
      stats
    });

  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all teachers' attendance (Admin)
exports.getAllAttendance = async (req, res) => {
  try {
    const { date, status, employeeId, startDate, endDate } = req.query;

    let query = {};

    if (date) {
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: selectedDate, $lt: nextDay };
    } else if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (status) {
      query.status = status;
    }

    if (employeeId) {
      query.employeeId = employeeId;
    }

    const attendance = await TeacherAttendance.find(query)
      .populate('teacher', 'name email employeeId')
      .sort({ date: -1, checkInTime: -1 });

    res.json({ attendance });

  } catch (error) {
    console.error('Error getting all attendance:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get today's summary (Admin)
exports.getTodaySummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await TeacherAttendance.find({
      date: { $gte: today, $lt: tomorrow }
    }).populate('teacher', 'name email employeeId');

    // Get all teachers
    const allTeachers = await User.find({ role: 'teacher', isActive: true });

    // Find teachers who haven't marked attendance
    const markedTeacherIds = attendance.map(a => a.teacher?._id?.toString() || a.teacher?.toString());
    const absentTeachers = allTeachers.filter(t => !markedTeacherIds.includes(t._id.toString()));

    // --- AUTO-ABSENT PERSISTENCE LOGIC ---
    // If it's after 6 PM, we automatically mark missing teachers as 'Absent' in the DB
    const now = new Date();
    const cutoffHour = 18; // 6 PM

    if (now.getHours() >= cutoffHour) {
      for (const t of absentTeachers) {
        try {
          // Double check if already exists to prevent race conditions
          const exists = await TeacherAttendance.findOne({
            teacher: t._id,
            date: today
          });

          if (!exists) {
            const autoAbsent = new TeacherAttendance({
              teacher: t._id,
              teacherName: t.name,
              employeeId: t.employeeId,
              date: today,
              status: 'Absent',
              remarks: 'Automatically marked absent (System Cutoff)',
              markedBy: 'system',
              checkInTime: 'N/A'
            });
            await autoAbsent.save();
            console.log(`🤖 Auto-marked absent: ${t.name}`);
          }
        } catch (e) {
          console.error(`Error auto-marking ${t.name}:`, e.message);
        }
      }

      // Re-fetch attendance after potential auto-marks to get updated counts
      const updatedAttendance = await TeacherAttendance.find({
        date: { $gte: today, $lt: tomorrow }
      }).populate('teacher', 'name email employeeId');

      const summary = {
        total: allTeachers.length,
        present: updatedAttendance.filter(a => a.status === 'Present').length,
        absent: updatedAttendance.filter(a => a.status === 'Absent').length,
        halfDay: updatedAttendance.filter(a => a.status === 'Half-Day').length,
        leave: updatedAttendance.filter(a => a.status === 'Leave').length,
        notMarked: allTeachers.length - updatedAttendance.length,
        attendance: updatedAttendance
      };
      return res.json(summary);
    }
    // --- END AUTO-LOGIC ---

    const summary = {
      total: allTeachers.length,
      present: attendance.filter(a => a.status === 'Present').length,
      absent: absentTeachers.length,
      halfDay: attendance.filter(a => a.status === 'Half-Day').length,
      leave: attendance.filter(a => a.status === 'Leave').length,
      notMarked: absentTeachers.length,
      attendance,
      absentTeachers: absentTeachers.map(t => ({
        _id: t._id,
        name: t.name,
        employeeId: t.employeeId,
        email: t.email
      }))
    };

    res.json(summary);

  } catch (error) {
    console.error('Error getting today summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get specific teacher's attendance (Admin)
exports.getTeacherAttendance = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { month, year, startDate, endDate } = req.query;

    let query = { teacher: teacherId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      query.date = { $gte: start, $lte: end };
    }

    const attendance = await TeacherAttendance.find(query)
      .populate('teacher', 'name email employeeId')
      .sort({ date: -1 });

    // Calculate statistics
    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'Present').length,
      absent: attendance.filter(a => a.status === 'Absent').length,
      halfDay: attendance.filter(a => a.status === 'Half-Day').length,
      leave: attendance.filter(a => a.status === 'Leave').length,
      percentage: attendance.length > 0
        ? ((attendance.filter(a => a.status === 'Present').length / attendance.length) * 100).toFixed(2)
        : 0
    };

    res.json({
      attendance,
      stats
    });

  } catch (error) {
    console.error('Error getting teacher attendance:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark attendance by admin
exports.markAttendanceByAdmin = async (req, res) => {
  try {
    const { teacherId, date, status, remarks } = req.body;

    if (!teacherId || !date || !status) {
      return res.status(400).json({ message: 'Teacher ID, date, and status are required' });
    }

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    // Check if attendance already exists
    const existing = await TeacherAttendance.findOne({
      teacher: teacherId,
      date: selectedDate
    });

    if (existing) {
      return res.status(400).json({
        message: 'Attendance already marked for this date',
        attendance: existing
      });
    }

    const attendance = new TeacherAttendance({
      teacher: teacherId,
      teacherName: teacher.name,
      employeeId: teacher.employeeId,
      date: selectedDate,
      status,
      remarks: remarks || 'Marked by admin',
      markedBy: 'admin'
    });

    await attendance.save();

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance
    });

  } catch (error) {
    console.error('Error marking attendance by admin:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update attendance (Admin)
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const attendance = await TeacherAttendance.findById(id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    if (status) attendance.status = status;
    if (remarks !== undefined) attendance.remarks = remarks;

    await attendance.save();

    res.json({
      message: 'Attendance updated successfully',
      attendance
    });

  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete attendance (Admin)
exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await TeacherAttendance.findByIdAndDelete(id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json({ message: 'Attendance deleted successfully' });

  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get attendance report (Admin)
exports.getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, teacherId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    let query = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (teacherId) {
      query.teacher = teacherId;
    }

    const attendance = await TeacherAttendance.find(query)
      .populate('teacher', 'name email employeeId')
      .sort({ date: 1 });

    // Group by teacher
    const teacherStats = {};
    attendance.forEach(record => {
      const tId = record.teacher._id.toString();
      if (!teacherStats[tId]) {
        teacherStats[tId] = {
          teacher: record.teacher,
          total: 0,
          present: 0,
          absent: 0,
          halfDay: 0,
          leave: 0
        };
      }
      teacherStats[tId].total++;
      if (record.status === 'Present') teacherStats[tId].present++;
      if (record.status === 'Absent') teacherStats[tId].absent++;
      if (record.status === 'Half-Day') teacherStats[tId].halfDay++;
      if (record.status === 'Leave') teacherStats[tId].leave++;
    });

    // Calculate percentages
    Object.keys(teacherStats).forEach(tId => {
      const stats = teacherStats[tId];
      stats.percentage = stats.total > 0
        ? ((stats.present / stats.total) * 100).toFixed(2)
        : 0;
    });

    res.json({
      attendance,
      summary: Object.values(teacherStats)
    });

  } catch (error) {
    console.error('Error getting report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
