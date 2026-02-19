const express = require('express');
const router = express.Router();

/**
 * Health Check & Cron Status Routes
 * These endpoints help monitor the server and cron jobs on cloud platforms like Render
 */

// Simple health check - keeps server alive on platforms with auto-sleep
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Server is running'
  });
});

// Detailed health check with system info
router.get('/status', (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    timezone: process.env.TZ || 'System Default',
    uptime: {
      seconds: Math.floor(process.uptime()),
      formatted: formatUptime(process.uptime())
    },
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
    },
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });
});

// Cron job status endpoint with detailed information
router.get('/cron-status', async (req, res) => {
  const currentTime = new Date();
  const istTime = currentTime.toLocaleString('en-US', { 
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'long'
  });
  
  // Try to get teacher cron status and settings
  let teacherCronStatus = null;
  let teacherSettings = null;
  
  try {
    const { getCronStatus } = require('../cron/teacherAttendanceCron');
    teacherCronStatus = getCronStatus();
  } catch (error) {
    console.error('Error getting teacher cron status:', error);
  }
  
  try {
    const SystemConfig = require('../models/SystemConfig');
    const config = await SystemConfig.findOne({ key: 'default_config' });
    if (config && config.teacherAttendanceSettings) {
      teacherSettings = config.teacherAttendanceSettings;
    }
  } catch (error) {
    console.error('Error getting teacher settings:', error);
  }
  
  // Calculate actual cron time from deadline
  let cronScheduleTime = '18:05'; // default
  if (teacherSettings && teacherSettings.deadlineTime) {
    const [hours, minutes] = teacherSettings.deadlineTime.split(':').map(Number);
    let cronMinutes = minutes + 5;
    let cronHours = hours;
    if (cronMinutes >= 60) {
      cronMinutes -= 60;
      cronHours += 1;
    }
    cronScheduleTime = `${String(cronHours).padStart(2, '0')}:${String(cronMinutes).padStart(2, '0')}`;
  }
  
  res.status(200).json({
    status: 'OK',
    message: 'Cron jobs are configured and running',
    cronJobs: {
      studentAttendance: {
        schedule: 'Daily at 8:00 PM IST (20:00)',
        description: 'Auto-marks absent students as Leave',
        enabled: true,
        configured: true
      },
      teacherAttendanceCron: {
        schedule: `Daily at ${cronScheduleTime} IST`,
        deadlineTime: teacherSettings?.deadlineTime || '18:00',
        calculatedRunTime: cronScheduleTime,
        description: 'Auto-marks absent teachers as Leave (deadline + 5 min)',
        enabled: teacherSettings?.enabled ?? true,
        configurable: true,
        configured: teacherCronStatus?.isRunning ?? false,
        ...teacherCronStatus
      }
    },
    serverTime: {
      utc: currentTime.toISOString(),
      ist: istTime,
      timezone: process.env.TZ || 'System Default'
    },
    uptime: formatUptime(process.uptime()),
    note: 'Cron jobs run automatically based on Asia/Kolkata timezone',
    troubleshooting: {
      uptimeLessThan1Hour: process.uptime() < 3600,
      message: process.uptime() < 3600 
        ? 'Server recently restarted. If this happens frequently, instance might be sleeping (use UptimeRobot to keep alive).' 
        : 'Server uptime is healthy.'
    }
  });
});

// Ping endpoint for external monitoring services (UptimeRobot, etc.)
router.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Helper function to format uptime
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
}

module.exports = router;
