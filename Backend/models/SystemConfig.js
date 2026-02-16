const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        default: 'default_config'
    },
    yearlyLeaveLimit: {
        type: Number,
        required: true,
        default: 12 // Default to 12 leaves per year
    },
    semesterStartDate: {
        type: Date,
        default: null
    },
    semesterEndDate: {
        type: Date,
        default: null
    },
    academicYear: {
        type: String, // e.g., "2023-2024"
        default: new Date().getFullYear().toString()
    },
    // Teacher Attendance Automation Settings
    teacherAttendanceSettings: {
        enabled: {
            type: Boolean,
            default: true,
            description: 'Enable automatic teacher attendance marking'
        },
        deadlineTime: {
            type: String,
            default: '18:00', // 6:00 PM IST
            description: 'Time by which teachers must mark attendance (24-hour format HH:MM)'
        },
        halfDayThreshold: {
            type: String,
            default: '12:00', // 12:00 PM noon
            description: 'If attendance marked after this time, mark as half-day (24-hour format HH:MM)'
        },
        enableHalfDay: {
            type: Boolean,
            default: true,
            description: 'Enable half-day marking for late attendance'
        },
        autoMarkAsLeave: {
            type: Boolean,
            default: true,
            description: 'Automatically mark teachers as "Leave" if not filled by deadline'
        },
        excludeWeekends: {
            type: Boolean,
            default: true,
            description: 'Skip automated marking on Sundays (weekends)'
        },
        notifyTeachers: {
            type: Boolean,
            default: true,
            description: 'Send notification to teachers who missed attendance'
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
