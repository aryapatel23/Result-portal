const express = require('express');
const router = express.Router();
const { autoMarkTeacherAttendance } = require('../cron/teacherAttendanceCron');

// Test endpoint to manually trigger auto-attendance (for testing)
// Access: GET /api/test/cron-attendance?force=true (to run even on weekends)
router.get('/cron-attendance', async (req, res) => {
    try {
        const forceRun = req.query.force === 'true';
        console.log('\n🧪 TEST: Manually triggering teacher auto-attendance...');
        console.log('⏰ Current IST Time:', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        if (forceRun) {
            console.log('⚠️  FORCE MODE ENABLED - Will run even on weekends/holidays');
        }

        const result = await autoMarkTeacherAttendance(forceRun);

        if (result.success) {
            res.status(200).json({
                success: true,
                message: 'Teacher auto-attendance test completed successfully',
                data: result
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Teacher auto-attendance test failed',
                error: result.error
            });
        }
    } catch (error) {
        console.error('❌ Test Route Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during test',
            error: error.message
        });
    }
});

// Get cron status
router.get('/cron-status', (req, res) => {
    const now = new Date();
    const istTime = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

    res.json({
        success: true,
        cron: {
            status: 'ACTIVE',
            name: 'Teacher Attendance Auto-Mark',
            timezone: 'Asia/Kolkata',
            currentTime: istTime,
            testEndpoint: '/api/test/cron-attendance'
        }
    });
});

module.exports = router;
