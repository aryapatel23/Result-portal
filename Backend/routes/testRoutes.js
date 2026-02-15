const express = require('express');
const router = express.Router();
const { autoMarkAbsentTeachers } = require('../cron/attendanceCron');

// Test endpoint to manually trigger auto-attendance (for testing)
// Access: GET /api/test/cron-attendance?force=true (to run even on weekends)
router.get('/cron-attendance', async (req, res) => {
    try {
        const forceRun = req.query.force === 'true';
        console.log('\n🧪 TEST: Manually triggering auto-attendance...');
        console.log('⏰ Current IST Time:', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        if (forceRun) {
            console.log('⚠️  FORCE MODE ENABLED - Will run even on weekends');
        }
        
        const result = await autoMarkAbsentTeachers(forceRun);
        
        if (result.success) {
            res.status(200).json({
                success: true,
                message: 'Auto-attendance test completed successfully',
                data: result
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Auto-attendance test failed',
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
            schedule: 'Daily at 8:00 PM IST',
            timezone: 'Asia/Kolkata',
            currentTime: istTime,
            nextRun: 'Today at 8:00 PM IST (if not past) or Tomorrow at 8:00 PM IST',
            testEndpoint: '/api/test/cron-attendance'
        }
    });
});

module.exports = router;
