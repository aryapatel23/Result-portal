const express = require('express');
const router = express.Router();

/**
 * Health Check & Cron Status Routes
 * OPTIMIZED for minimal CPU/memory usage on Render free tier
 * These endpoints help monitor the server and cron jobs on cloud platforms
 */

// Ultra-lightweight health check (minimal overhead)
// Note: /ping is defined in server.js BEFORE middleware for maximum efficiency
router.get('/health', (req, res) => {
  // Set cache headers to reduce redundant requests
  res.setHeader('Cache-Control', 'public, max-age=60'); // Cache for 1 minute
  res.status(200).json({
    status: 'OK',
    uptime: Math.floor(process.uptime())
  });
});

// Detailed health check with system info (cached for 30 seconds)
router.get('/status', (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  // Cache this endpoint to reduce CPU usage
  res.setHeader('Cache-Control', 'public, max-age=30');
  
  res.status(200).json({
    status: 'OK',
    timezone: process.env.TZ || 'System Default',
    uptime: formatUptime(process.uptime()),
    memory: {
      used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// Cron job status endpoint (cached for 2 minutes to reduce DB queries)
router.get('/cron-status', async (req, res) => {
  // Cache to reduce database load
  res.setHeader('Cache-Control', 'public, max-age=120');
  
  const currentTime = new Date();
  const istTime = currentTime.toLocaleString('en-US', { 
    timeZone: 'Asia/Kolkata',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Try to get teacher cron status and settings
  let teacherCronStatus = null;
  let teacherSettings = null;
  
  try {
    const { getCronStatus } = require('../cron/teacherAttendanceCron');
    teacherCronStatus = getCronStatus();
  } catch (error) {
    // Silent fail - don't log on every request
  }
  
  try {
    const SystemConfig = require('../models/SystemConfig');
    const config = await SystemConfig.findOne({ key: 'default_config' })
      .select('teacherAttendanceSettings') // Only select needed fields
      .lean(); // Use lean() for better performance
    if (config && config.teacherAttendanceSettings) {
      teacherSettings = config.teacherAttendanceSettings;
    }
  } catch (error) {
    // Silent fail - don't log on every request
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
    cronJobs: {
      studentAttendance: {
        schedule: '20:00 IST',
        enabled: true
      },
      teacherAttendance: {
        schedule: cronScheduleTime,
        deadline: teacherSettings?.deadlineTime || '18:00',
        enabled: teacherSettings?.enabled ?? true,
        running: teacherCronStatus?.isRunning ?? false
      }
    },
    server: {
      time: istTime,
      uptime: formatUptime(process.uptime())
    }
  });
});

// Note: /ping endpoint is defined in server.js BEFORE middleware
// for maximum efficiency (bypasses JSON parser, CORS, compression)

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
