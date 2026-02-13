const TeacherAttendance = require('../models/TeacherAttendance');
const User = require('../models/User');

// Load environment variables
require('dotenv').config();

// School location from environment variables
const SCHOOL_LOCATION = {
  latitude: parseFloat(process.env.SCHOOL_LATITUDE) || 22.81713251852116,
  longitude: parseFloat(process.env.SCHOOL_LONGITUDE) || 72.47335209589137,
  maxDistance: parseFloat(process.env.SCHOOL_ATTENDANCE_RADIUS_KM) || 3
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

// Helper: Get Current IST Date Details
const getISTTime = () => {
  const now = new Date();
  const istDateString = now.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' });
  const istDate = new Date(istDateString);

  return {
    now, // UTC actual
    istDate, // 00:00:00 IST
    day: istDate.getDate(),
    monthStr: `${String(istDate.getMonth() + 1).padStart(2, '0')}-${istDate.getFullYear()}`, // MM-YYYY
    year: istDate.getFullYear(),
    timeStr: now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    })
  };
};

// Mark attendance (Teacher)
exports.markAttendance = async (req, res) => {
  try {
    const { status, location, remarks } = req.body;
    const teacherId = req.user.id || req.user._id;

    if (!teacherId) return res.status(401).json({ message: 'User ID missing' });

    // Get teacher details
    const teacher = await User.findById(teacherId);
    if (!teacher) return res.status(404).json({ message: 'User not found' });

    const { istDate, day, monthStr, year, timeStr } = getISTTime();

    // 1. Find or Initialize Monthly Document
    let attendanceDoc = await TeacherAttendance.findOne({
      teacher: teacherId,
      month: monthStr
    });

    if (!attendanceDoc) {
      attendanceDoc = new TeacherAttendance({
        teacher: teacherId,
        month: monthStr,
        year: year,
        records: [],
        stats: { present: 0, absent: 0, leaves: 0, halfDay: 0, late: 0 }
      });
    }

    // 2. Check overlap
    const existingRecord = attendanceDoc.records.find(r => r.day === day);
    if (existingRecord) {
      return res.status(400).json({
        message: 'Attendance already marked for today',
        attendance: existingRecord
      });
    }

    let distance = 0;

    // 3. Location Check (Skip for Leave)
    if (status !== 'Leave') {
      if (!location || !location.latitude || !location.longitude) {
        return res.status(400).json({ message: 'Location is required' });
      }

      distance = calculateDistance(
        location.latitude,
        location.longitude,
        SCHOOL_LOCATION.latitude,
        SCHOOL_LOCATION.longitude
      );

      if (distance > SCHOOL_LOCATION.maxDistance) {
        return res.status(400).json({
          message: `Out of range. Dist: ${distance.toFixed(2)}km`,
          distance: distance.toFixed(2),
          schoolLocation: SCHOOL_LOCATION
        });
      }
    }

    // 4. Leave Limit Check
    if (status === 'Leave') {
      const SystemConfig = require('../models/SystemConfig');
      const config = await SystemConfig.findOne({ key: 'default_config' });
      const limit = config ? config.yearlyLeaveLimit : 12;

      // We need to count leaves across ALL monthly documents for this year
      // Aggregation is best here
      const aggResult = await TeacherAttendance.aggregate([
        { $match: { teacher: new mongoose.Types.ObjectId(teacherId), year: year } },
        { $group: { _id: null, totalLeaves: { $sum: "$stats.leaves" } } }
      ]);

      const leavesTaken = aggResult.length > 0 ? aggResult[0].totalLeaves : 0;

      if (leavesTaken >= limit) {
        return res.status(400).json({
          message: `Leave limit exceeded (${leavesTaken}/${limit}).`
        });
      }
    }

    // 5. Add Record
    const newRecord = {
      date: istDate,
      day: day,
      status: status || 'Present',
      checkInTime: timeStr,
      location: location ? {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || (status !== 'Leave' ? `${distance.toFixed(2)} km` : 'N/A')
      } : undefined,
      remarks: remarks || '',
      markedBy: 'self'
    };

    attendanceDoc.records.push(newRecord);

    // 6. Update Stats
    const statusKey = status === 'Present' ? 'present'
      : status === 'Absent' ? 'absent'
        : status === 'Leave' ? 'leaves'
          : status === 'Half-Day' ? 'halfDay' : 'present';

    if (attendanceDoc.stats[statusKey] !== undefined) {
      attendanceDoc.stats[statusKey]++;
    }

    await attendanceDoc.save();

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance: newRecord,
      distance: distance.toFixed(2)
    });

  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get today's attendance status
exports.getTodayStatus = async (req, res) => {
  try {
    const teacherId = req.user.id || req.user._id;
    const { day, monthStr } = getISTTime();

    const doc = await TeacherAttendance.findOne({ teacher: teacherId, month: monthStr });
    const todayRecord = doc ? doc.records.find(r => r.day === day) : null;

    res.json({
      marked: !!todayRecord,
      attendance: todayRecord || null
    });

  } catch (error) {
    console.error('Error getting today status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get my attendance history
exports.getMyHistory = async (req, res) => {
  try {
    const teacherId = req.user.id || req.user._id;
    // We fetch all records for now or paginate by year?
    // Let's fetch current year by default or all time

    const docs = await TeacherAttendance.find({ teacher: teacherId }).sort({ year: -1, month: -1 });

    // Flatten records for compatibility
    let allRecords = [];
    let totalStats = { present: 0, absent: 0, leaves: 0, halfDay: 0 };

    docs.forEach(doc => {
      allRecords.push(...doc.records);
      totalStats.present += doc.stats.present;
      totalStats.absent += doc.stats.absent;
      totalStats.leaves += doc.stats.leaves;
      totalStats.halfDay += doc.stats.halfDay;
    });

    // Sort by date desc
    allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate Limits
    const SystemConfig = require('../models/SystemConfig');
    const config = await SystemConfig.findOne({ key: 'default_config' });
    const yearlyLimit = config ? config.yearlyLeaveLimit : 12;

    const stats = {
      ...totalStats,
      leavesTakenYearly: totalStats.leaves, // Assuming all fetched docs are relevant, or filter by year
      yearlyLeaveLimit: yearlyLimit,
      total: allRecords.length,
      percentage: allRecords.length > 0
        ? ((totalStats.present / allRecords.length) * 100).toFixed(2)
        : 0
    };

    res.json({
      attendance: allRecords, // Flattened for frontend
      stats
    });

  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all attendance (Admin) -> Needs to handle buckets
exports.getAllAttendance = async (req, res) => {
  // This is complex with buckets if we want filtering by date
  // For simplicity, we'll implement date filtering
  try {
    const { date } = req.query;
    let query = {};

    // If date provided, find docs that *could* match (by month)
    // Then filter records

    let docs = await TeacherAttendance.find(query).populate('teacher', 'name email employeeId');

    let flatRecords = [];
    docs.forEach(doc => {
      doc.records.forEach(rec => {
        flatRecords.push({
          ...rec.toObject(),
          teacherName: doc.teacher ? doc.teacher.name : 'Unknown',
          employeeId: doc.teacher ? doc.teacher.employeeId : 'N/A',
          teacherId: doc.teacher ? doc.teacher._id : null,
          month: doc.month
        });
      });
    });

    // Filter by date if needed
    if (date) {
      const searchDate = new Date(date).toDateString();
      flatRecords = flatRecords.filter(r => new Date(r.date).toDateString() === searchDate);
    }

    flatRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ attendance: flatRecords });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get today's summary (Admin)
exports.getTodaySummary = async (req, res) => {
  try {
    const { day, monthStr } = getISTTime();

    // Find all docs for this month
    const docs = await TeacherAttendance.find({ month: monthStr }).populate('teacher', 'name email employeeId');

    let todayRecords = [];
    let markedTeacherIds = [];

    docs.forEach(doc => {
      const rec = doc.records.find(r => r.day === day);
      if (rec) {
        todayRecords.push({
          ...rec.toObject(),
          teacherName: doc.teacher ? doc.teacher.name : 'Unknown',
          employeeId: doc.teacher ? doc.teacher.employeeId : 'N/A',
          teacherId: doc.teacher ? doc.teacher._id : null
        });
        markedTeacherIds.push(doc.teacher._id.toString());
      }
    });

    const allTeachers = await User.find({ role: 'teacher' });
    const absentTeachers = allTeachers.filter(t => !markedTeacherIds.includes(t._id.toString()));

    // Stats
    const notMarkedCount = absentTeachers.length;
    const explicitlyAbsentCount = todayRecords.filter(r => r.status === 'Absent').length;

    const summary = {
      total: allTeachers.length,
      present: todayRecords.filter(r => r.status === 'Present').length,
      absent: explicitlyAbsentCount,
      notMarked: notMarkedCount,
      halfDay: todayRecords.filter(r => r.status === 'Half-Day').length,
      leave: todayRecords.filter(r => r.status === 'Leave').length,
      attendance: todayRecords,
      absentTeachers: absentTeachers.map(t => ({
        _id: t._id, name: t.name, employeeId: t.employeeId, email: t.email
      }))
    };

    res.json(summary);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get specific teacher attendance (Admin)
exports.getTeacherAttendance = async (req, res) => {
  // Reuse getMyHistory logic basically
  try {
    const { teacherId } = req.params;
    const docs = await TeacherAttendance.find({ teacher: teacherId });

    let allRecords = [];
    let stats = { present: 0, absent: 0, leaves: 0, halfDay: 0 };

    docs.forEach(doc => {
      allRecords.push(...doc.records);
      stats.present += doc.stats.present;
      stats.absent += doc.stats.absent;
      stats.leaves += doc.stats.leaves;
      stats.halfDay += doc.stats.halfDay;
    });

    allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      attendance: allRecords,
      stats: {
        ...stats,
        total: allRecords.length,
        percentage: allRecords.length > 0 ? ((stats.present / allRecords.length) * 100).toFixed(2) : 0
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper to recalculate stats
const recalculateStats = (doc) => {
  const stats = { present: 0, absent: 0, leaves: 0, halfDay: 0, late: 0 };
  doc.records.forEach(r => {
    if (r.status === 'Present') stats.present++;
    else if (r.status === 'Absent') stats.absent++;
    else if (r.status === 'Leave') stats.leaves++;
    else if (r.status === 'Half-Day') stats.halfDay++;
  });
  doc.stats = stats;
};

// Admin Mark Attendance
exports.markAttendanceByAdmin = async (req, res) => {
  try {
    const { teacherId, date, status, remarks } = req.body;

    const teacher = await User.findById(teacherId);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const attendDate = new Date(date);
    const monthStr = `${String(attendDate.getMonth() + 1).padStart(2, '0')}-${attendDate.getFullYear()}`;
    const day = attendDate.getDate();

    let doc = await TeacherAttendance.findOne({
      teacher: teacherId,
      month: monthStr
    });

    if (!doc) {
      doc = new TeacherAttendance({
        teacher: teacherId,
        month: monthStr,
        year: attendDate.getFullYear(),
        records: [],
        stats: { present: 0, absent: 0, leaves: 0, halfDay: 0, late: 0 }
      });
    }

    // Check if record exists
    const existingRecordIndex = doc.records.findIndex(r => r.day === day);
    const newRecord = {
      date: attendDate,
      day: day,
      status: status || 'Present',
      checkInTime: '09:00 AM', // Default for manual admin entry
      location: { address: 'Marked by Admin' },
      remarks: remarks || 'Marked by Admin',
      markedBy: 'admin'
    };

    if (existingRecordIndex >= 0) {
      doc.records[existingRecordIndex] = newRecord;
    } else {
      doc.records.push(newRecord);
    }

    recalculateStats(doc);
    await doc.save();

    res.status(200).json({ message: 'Attendance marked successfully' });

  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update Attendance
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params; // records._id
    const { status } = req.body;

    const doc = await TeacherAttendance.findOne({ "records._id": id });
    if (!doc) return res.status(404).json({ message: 'Record not found' });

    const record = doc.records.id(id);
    if (!record) return res.status(404).json({ message: 'Record sub-document not found' });

    record.status = status;
    if (req.body.remarks) record.remarks = req.body.remarks;

    recalculateStats(doc);
    await doc.save();

    res.status(200).json({ message: 'Attendance updated successfully', record });

  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete Attendance
exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await TeacherAttendance.findOne({ "records._id": id });
    if (!doc) return res.status(404).json({ message: 'Record not found' });

    doc.records.pull(id);
    recalculateStats(doc);
    await doc.save();

    res.status(200).json({ message: 'Attendance record deleted' });

  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAttendanceReport = async (req, res) => {
  res.status(501).json({ message: 'Migration in progress' });
};

