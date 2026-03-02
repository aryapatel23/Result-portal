const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const connectDB = require("./config/db");
const { initAttendanceCron } = require("./cron/attendanceCron");
const { startTeacherAttendanceCron } = require("./cron/teacherAttendanceCron");

// 🛡️ Security Middleware Imports
const {
  helmetConfig,
  hppConfig,
  customSecurityHeaders,
  sanitizeRequest,
  preventCommonAttacks,
} = require("./middleware/securityMiddleware");

const {
  generalLimiter,
  authLimiter,
  forgotPasswordLimiter,
  uploadLimiter,
  createUserLimiter,
} = require("./middleware/rateLimitMiddleware");

const {
  devLogger,
  prodLogger,
  consoleLogger,
  logError,
  detectSuspiciousActivity,
  requestLogger,
} = require("./middleware/loggerMiddleware");

const { corsOptions } = require("./config/corsConfig");

dotenv.config();

// Set timezone for cron jobs (important for cloud deployments)
process.env.TZ = process.env.TZ || 'Asia/Kolkata';

// Memory optimization: Set max old space size for better garbage collection
if (process.env.NODE_ENV === 'production') {
  process.env.NODE_OPTIONS = '--max-old-space-size=512'; // Limit memory to 512MB
}

connectDB();

const app = express();

// ===============================
// 🛡️ SECURITY MIDDLEWARE (FIRST)
// ===============================

// Ultra-lightweight ping endpoint (NO middleware overhead for UptimeRobot)
app.get('/api/health/ping', (req, res) => {
  res.status(200).send('pong');
});

// 1. Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// 2. Helmet - Security headers
app.use(helmetConfig);

// 3. Custom security headers
app.use(customSecurityHeaders);

// 4. CORS - Cross-origin protection
app.use(cors(corsOptions));

// 5. Logging middleware
if (process.env.NODE_ENV === 'production') {
  app.use(prodLogger); // File logging
  app.use(consoleLogger); // Console logging
} else {
  // Skip morgan in development for cleaner logs
  // app.use(devLogger);
}

// 6. Body parsers with size limits (MUST BE EARLY)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  console.log('   Content-Type:', req.headers['content-type']);
  console.log('   Body:', JSON.stringify(req.body));
  next();
});

// 7. Request logger
app.use(requestLogger);

// Debug middleware to check body parsing
app.use((req, res, next) => {
  if (req.path.includes('/auth/forgot-password')) {
    console.log('🔍 Debug - forgot-password request:');
    console.log('  Body:', req.body);
    console.log('  Headers:', req.headers['content-type']);
  }
  next();
});

// 8. Suspicious activity detection (AFTER body parsing)
app.use(detectSuspiciousActivity);

// 9. Response compression
app.use(compression({
  threshold: 1024,
  level: 6
}));

// 10. NoSQL injection protection (with safe configuration)
app.use((req, res, next) => {
  try {
    // Safely sanitize body
    if (req.body && typeof req.body === 'object') {
      req.body = mongoSanitize.sanitize(req.body, { replaceWith: '_' });
    }
    // Safely sanitize params
    if (req.params && typeof req.params === 'object') {
      req.params = mongoSanitize.sanitize(req.params, { replaceWith: '_' });
    }
    // Safely sanitize query (create new object instead of modifying frozen one)
    if (req.query && typeof req.query === 'object') {
      try {
        const sanitizedQuery = mongoSanitize.sanitize(req.query, { replaceWith: '_' });
        // Only replace if query is not frozen
        if (!Object.isFrozen(req.query)) {
          req.query = sanitizedQuery;
        }
      } catch (err) {
        // If query is frozen, skip sanitization
        console.warn('⚠️  Could not sanitize frozen query params');
      }
    }
  } catch (error) {
    console.error('❌ Sanitization error:', error.message);
  }
  next();
});

// 11. HTTP Parameter Pollution protection
app.use(hppConfig);

// 12. XSS protection
app.use(sanitizeRequest);

// 13. Prevent common attacks
app.use(preventCommonAttacks);

// 14. General API rate limiting
app.use('/api/', generalLimiter);

// ===============================
// HEALTH CHECK ROUTES (BEFORE AUTH)
// ===============================
app.use("/api/health", require("./routes/healthRoutes"));

// ===============================
// API ROUTES WITH SPECIFIC RATE LIMITERS
// ===============================

// Authentication routes (with specific rate limiting applied in routes)
app.use("/api/auth", require("./routes/authRoutes"));

// Profile routes
app.use("/api/profile", require("./routes/profileRoutes"));

// Results routes
app.use("/api/results", require("./routes/resultRoutes"));

// Admin routes
app.use("/api/admin", require("./routes/adminTeacherRoutes"));

// Teacher routes
app.use("/api/teacher", require("./routes/teacherRoutes"));

// Student routes
app.use("/api/student", require("./routes/studentRoutes"));

// Timetable routes
app.use("/api/timetable", require("./routes/timetableRoutes"));

// Bulk operations (with upload rate limit)
app.use("/api/bulk-students", uploadLimiter, require("./routes/bulkStudentRoutes"));
app.use("/api/bulk-results", uploadLimiter, require("./routes/bulkResultRoutes"));

// Student management
app.use("/api/student-promotion", require("./routes/studentPromotionRoutes"));
app.use("/api/student-management", require("./routes/studentManagementRoutes"));

// PDF generation
app.use("/api/pdf", require("./routes/pdfRoutes"));

// Attendance routes
app.use("/api/teacher-attendance", require("./routes/teacherAttendanceRoutes"));
app.use("/api/admin/attendance", require("./routes/adminAttendanceRoutes"));

// Face registration (with upload rate limit)
app.use("/api/face", uploadLimiter, require("./routes/faceRegistrationRoutes"));

// System configuration
app.use("/api/system-config", require("./routes/systemConfigRoutes"));
app.use("/api/admin/holidays", require("./routes/holidayRoutes"));

// Test endpoints
app.use("/api/test", require("./routes/testRoutes"));

// Teacher performance analytics
app.use("/api/performance", require("./routes/teacherPerformanceRoutes"));

console.log('✅ All routes registered with security middleware');
console.log('🛡️  Security features enabled:');
console.log('   ✓ Helmet (Security Headers)');
console.log('   ✓ CORS Protection');
console.log('   ✓ Rate Limiting');
console.log('   ✓ NoSQL Injection Protection');
console.log('   ✓ XSS Protection');
console.log('   ✓ Request Sanitization');
console.log('   ✓ Security Logging');

// ===============================
// ERROR HANDLING MIDDLEWARE (LAST)
// ===============================

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use(logError);
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err.message);
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.get("/", (req, res) => {
  res.send("📘 Student Result Portal API is running securely.");
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