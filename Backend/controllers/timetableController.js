const Timetable = require('../models/Timetable');
const User = require('../models/User');

// Get timetable for a specific teacher
const getTimetable = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { academicYear = '2024-25' } = req.query;

    // Verify teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Get timetable
    let timetable = await Timetable.findOne({ 
      teacher: teacherId, 
      academicYear 
    }).populate('teacher', 'name employeeId subjects assignedClasses');

    // If no timetable exists, create empty one
    if (!timetable) {
      timetable = {
        teacher: teacher,
        academicYear,
        schedule: {
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: [],
          Saturday: []
        }
      };
    } else {
      // Parse timeSlot into startTime and endTime for existing entries
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      days.forEach(day => {
        if (timetable.schedule[day]) {
          timetable.schedule[day] = timetable.schedule[day].map(period => {
            if (period.timeSlot && !period.startTime && !period.endTime) {
              const times = period.timeSlot.split(' - ');
              if (times.length === 2) {
                return {
                  ...period.toObject(),
                  startTime: times[0].trim(),
                  endTime: times[1].trim()
                };
              }
            }
            return period.toObject ? period.toObject() : period;
          });
        }
      });
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
    res.status(500).json({ message: 'Server error' });
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
  } catch (error) {
    console.error('Error saving timetable:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Timetable already exists for this teacher and academic year' });
    }
    res.status(500).json({ message: 'Server error' });
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

module.exports = {
  getTimetable,
  saveTimetable,
  getMyTimetable,
  deleteTimetable
};
