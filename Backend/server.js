const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const compression = require("compression"); // Add compression for bandwidth optimization
const connectDB = require("./config/db"); // ✅ Ensure the path is correct
const { initAttendanceCron } = require("./cron/attendanceCron"); // Import Student Attendance Cron
const { startTeacherAttendanceCron } = require("./cron/teacherAttendanceCron"); // Import Teacher Attendance Cron

dotenv.config();

// Set timezone for cron jobs (important for cloud deployments)
process.env.TZ = process.env.TZ || 'Asia/Kolkata';

// Memory optimization: Set max old space size for better garbage collection
if (process.env.NODE_ENV === 'production') {
  process.env.NODE_OPTIONS = '--max-old-space-size=512'; // Limit memory to 512MB
}

connectDB();

const app = express();

// Ultra-lightweight ping endpoint (NO middleware overhead for UptimeRobot)
app.get('/api/health/ping', (req, res) => {
  res.status(200).send('pong');
});

// Response compression (reduces bandwidth by ~70%)
app.use(compression({
  threshold: 1024, // Only compress responses > 1KB
  level: 6 // Balanced compression (1=fastest, 9=best compression)
}));

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Add size limit to prevent memory issues

// Health check routes (MUST be before other routes for monitoring services)
app.use("/api/health", require("./routes/healthRoutes"));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/results", require("./routes/resultRoutes"));
app.use("/api/admin", require("./routes/adminTeacherRoutes"));
app.use("/api/teacher", require("./routes/teacherRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/timetable", require("./routes/timetableRoutes"));
app.use("/api/bulk-students", require("./routes/bulkStudentRoutes"));
app.use("/api/student-promotion", require("./routes/studentPromotionRoutes"));
app.use("/api/bulk-results", require("./routes/bulkResultRoutes"));
app.use("/api/student-management", require("./routes/studentManagementRoutes"));
app.use("/api/pdf", require("./routes/pdfRoutes"));
app.use("/api/teacher-attendance", require("./routes/teacherAttendanceRoutes"));
app.use("/api/admin/attendance", require("./routes/adminAttendanceRoutes"));
app.use("/api/face", require("./routes/faceRegistrationRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/system-config", require("./routes/systemConfigRoutes")); // System configuration
app.use("/api/admin/holidays", require("./routes/holidayRoutes")); // Public holidays management
app.use("/api/test", require("./routes/testRoutes")); // Test endpoints for cron jobs

console.log('✅ All routes registered including health check routes');

app.get("/", (req, res) => {
  res.send("📘 Student Result Portal API is running.");
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 Access from this computer: http://localhost:${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🕐 Timezone: ${process.env.TZ}`);
  console.log(`💾 Memory Limit: ${process.env.NODE_OPTIONS || 'Default'}`);
  
  // Start Automated Attendance Cron Jobs after server is running
  console.log('\n🚀 Initializing Automated Cron Jobs...\n');
  
  try {
    initAttendanceCron(); // Student attendance (8:00 PM IST)
    console.log('✅ Student Attendance Cron initialized');
  } catch (error) {
    console.error('❌ Error initializing Student Attendance Cron:', error.message);
  }
  
  try {
    startTeacherAttendanceCron(); // Teacher attendance (6:05 PM IST)
    console.log('✅ Teacher Attendance Cron initialized');
  } catch (error) {
    console.error('❌ Error initializing Teacher Attendance Cron:', error.message);
  }
  
  console.log('\n✅ All Cron Jobs Started!');
  console.log('💡 Using timezone:', process.env.TZ || 'System Default');
  console.log('💡 Health check: /api/health/ping');
  console.log('💡 Cron status: /api/health/cron-status\n');
});

// Memory monitoring (log warnings if approaching limits)
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    const used = process.memoryUsage();
    const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
    if (heapUsedMB > 400) { // Warn at 400MB (before 512MB limit)
      console.warn(`⚠️  High memory usage: ${heapUsedMB}MB`);
    }
  }, 300000); // Check every 5 minutes
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔴 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔴 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});