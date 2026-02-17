const SystemConfig = require('../models/SystemConfig');
const { autoMarkTeacherAttendance, restartTeacherAttendanceCron } = require('../cron/teacherAttendanceCron');

// Get current system config
exports.getConfig = async (req, res) => {
    try {
        let config = await SystemConfig.findOne({ key: 'default_config' });

        // Create default if not exists
        if (!config) {
            config = new SystemConfig({ 
                key: 'default_config',
                teacherAttendanceSettings: {
                    enabled: true,
                    deadlineTime: '18:00',
                    halfDayThreshold: '12:00',
                    enableHalfDay: true,
                    autoMarkAsLeave: true,
                    excludeWeekends: true,
                    notifyTeachers: true
                }
            });
            await config.save();
        }

        res.json(config);
    } catch (error) {
        console.error('Error fetching config:', error);
        res.status(500).json({ message: 'Server error fetching configuration', error: error.message });
    }
};

// Update system config (Admin only)
exports.updateConfig = async (req, res) => {
    try {
        const { yearlyLeaveLimit, academicYear } = req.body;

        let config = await SystemConfig.findOne({ key: 'default_config' });

        if (!config) {
            config = new SystemConfig({ key: 'default_config' });
        }

        if (yearlyLeaveLimit !== undefined) config.yearlyLeaveLimit = Number(yearlyLeaveLimit);
        if (academicYear) config.academicYear = academicYear;

        await config.save();

        res.json({ message: 'System configuration updated successfully', config });
    } catch (error) {
        console.error('Error updating config:', error);
        res.status(500).json({ message: 'Server error updating configuration', error: error.message });
    }
};

// Get Teacher Attendance Settings
exports.getTeacherAttendanceSettings = async (req, res) => {
    try {
        let config = await SystemConfig.findOne({ key: 'default_config' });

        if (!config || !config.teacherAttendanceSettings) {
            // Return defaults if not found
            return res.json({
                enabled: true,
                deadlineTime: '18:00',
                halfDayThreshold: '12:00',
                enableHalfDay: true,
                autoMarkAsLeave: true,
                excludeWeekends: true,
                notifyTeachers: true
            });
        }

        res.json(config.teacherAttendanceSettings);
    } catch (error) {
        console.error('Error fetching teacher attendance settings:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update Teacher Attendance Settings (Admin only)
exports.updateTeacherAttendanceSettings = async (req, res) => {
    try {
        const {
            enabled,
            deadlineTime,
            halfDayThreshold,
            enableHalfDay,
            autoMarkAsLeave,
            excludeWeekends,
            notifyTeachers
        } = req.body;

        let config = await SystemConfig.findOne({ key: 'default_config' });

        if (!config) {
            config = new SystemConfig({ key: 'default_config' });
        }

        // Initialize if not exists
        if (!config.teacherAttendanceSettings) {
            config.teacherAttendanceSettings = {};
        }

        // Track if deadline time changed
        const oldDeadlineTime = config.teacherAttendanceSettings.deadlineTime;
        const deadlineChanged = deadlineTime && deadlineTime !== oldDeadlineTime;

        // Update fields
        if (enabled !== undefined) config.teacherAttendanceSettings.enabled = enabled;
        if (deadlineTime) {
            // Validate time format (HH:MM)
            if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(deadlineTime)) {
                return res.status(400).json({ message: 'Invalid time format. Use HH:MM (24-hour format)' });
            }
            config.teacherAttendanceSettings.deadlineTime = deadlineTime;
        }
        if (halfDayThreshold) {
            // Validate time format (HH:MM)
            if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(halfDayThreshold)) {
                return res.status(400).json({ message: 'Invalid time format. Use HH:MM (24-hour format)' });
            }
            config.teacherAttendanceSettings.halfDayThreshold = halfDayThreshold;
        }
        if (enableHalfDay !== undefined) config.teacherAttendanceSettings.enableHalfDay = enableHalfDay;
        if (autoMarkAsLeave !== undefined) config.teacherAttendanceSettings.autoMarkAsLeave = autoMarkAsLeave;
        if (excludeWeekends !== undefined) config.teacherAttendanceSettings.excludeWeekends = excludeWeekends;
        if (notifyTeachers !== undefined) config.teacherAttendanceSettings.notifyTeachers = notifyTeachers;

        await config.save();

        // Restart cron if deadline time changed
        if (deadlineChanged) {
            console.log('⚠️  Deadline time changed - Restarting cron job...');
            try {
                await restartTeacherAttendanceCron();
                console.log('✅ Cron job restarted with new schedule');
            } catch (error) {
                console.error('❌ Error restarting cron:', error);
                // Don't fail the request - settings are saved
            }
        }

        res.json({
            message: 'Teacher attendance settings updated successfully',
            settings: config.teacherAttendanceSettings,
            cronRestarted: deadlineChanged
        });
    } catch (error) {
        console.error('Error updating teacher attendance settings:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Test Teacher Attendance Auto-Mark (Force Run)
exports.testTeacherAttendanceAutoMark = async (req, res) => {
    try {
        console.log('🧪 Manual test triggered by admin');
        const result = await autoMarkTeacherAttendance(true); // Force run
        
        if (result.success) {
            res.json({
                success: true,
                message: `Test completed! Marked: ${result.markedCount || 0}, Already marked: ${result.alreadyMarkedCount || 0}`,
                details: {
                    totalTeachers: result.totalTeachers || 0,
                    markedCount: result.markedCount || 0,
                    alreadyMarkedCount: result.alreadyMarkedCount || 0,
                    notifiedCount: result.notifiedCount || 0,
                    markedTeachers: result.markedTeachers || []
                },
                result
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Test failed',
                error: result.error || 'Unknown error',
                result
            });
        }
    } catch (error) {
        console.error('Error in test auto-mark:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during test', 
            error: error.message 
        });
    }
};
