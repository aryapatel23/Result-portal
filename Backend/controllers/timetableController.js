const Timetable = require('../models/Timetable');
const User = require('../models/User');

const getTimetable = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { academicYear = '2024-25' } = req.query;

    if (!teacherId || teacherId === 'undefined') {
      return res.status(400).json({ message: 'Invalid teacher ID' });
    }

    // Verify teacher exists (handle invalid ID format)
    let teacher;
    try {
      teacher = await User.findById(teacherId);
    } catch (err) {
      if (err.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid teacher ID format' });
      }
      throw err;
    }

    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Get timetable using lean() for plain JS objects
    let timetable = await Timetable.findOne({
      teacher: teacherId,
      academicYear
    }).populate('teacher', 'name employeeId subjects assignedClasses').lean();

    // If timetable exists, pre-process periods
    if (timetable) {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      days.forEach(day => {
        if (timetable.schedule && timetable.schedule[day]) {
          timetable.schedule[day] = timetable.schedule[day].map(period => {
            // Ensure startTime/endTime are present even if timeSlot is the only data source (migration)
            if (period.timeSlot && !period.startTime && !period.endTime) {
              const times = period.timeSlot.split(' - ');
              if (times.length === 2) {
                return {
                  ...period,
                  startTime: times[0].trim(),
                  endTime: times[1].trim()
                };
              }
            }
            return period;
          });
        }
      });
    } else {
      // Return empty structure if not found
      timetable = {
        teacher: teacherId,
        academicYear,
        schedule: {
          Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: []
        }
      };
    }

    // Safely structure the response even if teacher fields are missing
    res.status(200).json({
      timetable,
      teacher: {
        name: teacher.name,
        employeeId: teacher.employeeId,
        subjects: teacher.subjects || [],
        assignedClasses: teacher.assignedClasses || []
      }
    });
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Create or update timetable
const saveTimetable = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { schedule, academicYear = '2024-25' } = req.body;
    const adminId = req.user.id;

    // Verify teacher exists
    let teacher;
    try {
      if (!teacherId) throw new Error('No teacher ID provided');
      teacher = await User.findById(teacherId);
    } catch (err) {
      if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid teacher ID' });
      throw err;
    }

    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Validate schedule structure
    console.log('Saving Timetable for:', teacher.name);
    console.log('Incoming Schedule Keys:', Object.keys(schedule || {}));

    if (!schedule || typeof schedule !== 'object') {
      return res.status(400).json({ message: 'Invalid schedule format' });
    }

    // Check if timetable exists
    let timetable = await Timetable.findOne({ teacher: teacherId, academicYear });

    try {
      if (timetable) {
        // Update existing timetable
        console.log('Updating existing timetable...');
        // Explicitly set each day to trigger Mongoose change tracking for arrays
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        days.forEach(day => {
          if (schedule[day]) {
            timetable.schedule[day] = schedule[day];
          }
        });

        timetable.lastModifiedBy = adminId;
        timetable.markModified('schedule'); // Critical for Mixed types or deep updates
        const saved = await timetable.save();
        console.log('Timetable updated. Modified paths:', saved.modifiedPaths());
      } else {
        // Create new timetable
        console.log('Creating new timetable...');
        timetable = new Timetable({
          teacher: teacherId,
          academicYear,
          schedule,
          createdBy: adminId,
          lastModifiedBy: adminId
        });
        await timetable.save();
        console.log('New timetable created.');
      }

      res.status(200).json({
        message: 'Timetable saved successfully',
        timetable
      });
    } catch (saveError) {
      console.error('Validation error saving timetable:', saveError);
      return res.status(400).json({
        // Return the actual validation message to the client
        message: 'Validation failed: ' + (saveError.message || 'Check required fields.')
      });
    }
  } catch (error) {
    console.error('Error in saveTimetable:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get teacher's own timetable
const getMyTimetable = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { academicYear = '2024-25' } = req.query;

    console.log('🔍 Fetching timetable for teacher:', teacherId, 'Year:', academicYear);
    console.log('📋 User from token:', JSON.stringify(req.user, null, 2));

    let timetable = await Timetable.findOne({
      teacher: teacherId,
      academicYear
    });

    console.log('📊 Timetable found:', timetable ? 'YES' : 'NO');
    if (timetable) {
      console.log('📅 Schedule days:', Object.keys(timetable.schedule));
      Object.keys(timetable.schedule).forEach(day => {
        console.log(`   ${day}: ${timetable.schedule[day].length} periods`);
      });
    }

    // If no timetable exists, return empty structure
    if (!timetable) {
      console.log('⚠️ No timetable found, returning empty structure');
      return res.status(200).json({
        timetable: {
          schedule: {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: []
          },
          academicYear
        }
      });
    }

    console.log('✅ Returning timetable with', Object.keys(timetable.schedule).length, 'days');
    res.status(200).json({ timetable });
  } catch (error) {
    console.error('❌ Error fetching timetable:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete timetable
const deleteTimetable = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { academicYear = '2024-25' } = req.query;

    const result = await Timetable.findOneAndDelete({
      teacher: teacherId,
      academicYear
    });

    if (!result) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    res.status(200).json({ message: 'Timetable deleted successfully' });
  } catch (error) {
    console.error('Error deleting timetable:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get student's class timetable
const getStudentTimetable = async (req, res) => {
  try {
    const studentClass = req.user.standard; // Use 'standard' field from User model
    const { academicYear = '2024-25' } = req.query;

    if (!studentClass) {
      return res.status(400).json({ message: 'Student class/standard not found' });
    }

    const allTimetables = await Timetable.find({ academicYear }).populate('teacher', 'name');

    const schedule = {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: []
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    allTimetables.forEach(t => {
      days.forEach(day => {
        const periods = t.schedule[day] || [];
        periods.forEach(p => {
          // Check if class matches (e.g. "10" or "STD 10" matches student's standard "10")
          if (p.class && p.class.includes(studentClass)) {
            schedule[day].push({
              _id: p._id,
              timeSlot: p.timeSlot,
              startTime: p.startTime,
              endTime: p.endTime,
              subject: p.subject,
              class: p.class,
              room: p.room,
              teacher: t.teacher?.name || 'Assigned Staff'
            });
          }
        });
      });
    });

    // Sort periods by time
    days.forEach(day => {
      schedule[day].sort((a, b) => {
        const timeA = a.startTime || a.timeSlot.split('-')[0].trim();
        const timeB = b.startTime || b.timeSlot.split('-')[0].trim();
        return timeA.localeCompare(timeB);
      });
    });

    res.status(200).json({ timetable: { schedule, academicYear } });
  } catch (error) {
    console.error('Error fetching student timetable:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getTimetable,
  saveTimetable,
  getMyTimetable,
  getStudentTimetable,
  deleteTimetable
};
