const Timetable = require('../models/Timetable');
const User = require('../models/User');

const getTimetable = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { academicYear = '2024-25' } = req.query;

    // Verify teacher exists
    const teacher = await User.findById(teacherId);
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

    res.status(200).json({
      timetable,
      teacher: {
        name: teacher.name,
        employeeId: teacher.employeeId,
        subjects: teacher.subjects,
        assignedClasses: teacher.assignedClasses
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
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Validate schedule structure
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (!schedule || typeof schedule !== 'object') {
      return res.status(400).json({ message: 'Invalid schedule format' });
    }

    // Check if timetable exists
    let timetable = await Timetable.findOne({ teacher: teacherId, academicYear });

    try {
      if (timetable) {
        // Update existing timetable
        timetable.schedule = schedule;
        timetable.lastModifiedBy = adminId;
        await timetable.save();
      } else {
        // Create new timetable
        timetable = new Timetable({
          teacher: teacherId,
          academicYear,
          schedule,
          createdBy: adminId,
          lastModifiedBy: adminId
        });
        await timetable.save();
      }

      res.status(200).json({
        message: 'Timetable saved successfully',
        timetable
      });
    } catch (saveError) {
      console.error('Validation error saving timetable:', saveError);
      return res.status(400).json({
        message: 'Validation failed: ' + (saveError.message || 'Check all required fields (Time, Subject, and Class).')
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

    let timetable = await Timetable.findOne({
      teacher: teacherId,
      academicYear
    });

    // If no timetable exists, return empty structure
    if (!timetable) {
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

    res.status(200).json({ timetable });
  } catch (error) {
    console.error('Error fetching timetable:', error);
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
    const { className, section } = req.user;
    const { academicYear = '2024-25' } = req.query;

    const allTimetables = await Timetable.find({ academicYear }).populate('teacher', 'name');

    const schedule = {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: []
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    allTimetables.forEach(t => {
      days.forEach(day => {
        const periods = t.schedule[day] || [];
        periods.forEach(p => {
          // Check if class matches (e.g. "10" or "STD 10")
          if (p.class && p.class.includes(className)) {
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
