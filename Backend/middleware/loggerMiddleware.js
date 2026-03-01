const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

/**
 * 📝 Security Logging Middleware
 * Logs all requests and security events
 */

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create write streams for different log types
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' } // append mode
);

const errorLogStream = fs.createWriteStream(
  path.join(logsDir, 'error.log'),
  { flags: 'a' }
);

const securityLogStream = fs.createWriteStream(
  path.join(logsDir, 'security.log'),
  { flags: 'a' }
);

// Custom morgan token for response time in ms
morgan.token('response-time-ms', (req, res) => {
  if (!req._startAt || !res._startAt) return '';
  const ms = (res._startAt[0] - req._startAt[0]) * 1000 +
    (res._startAt[1] - req._startAt[1]) / 1000000;
  return ms.toFixed(2);
});

// Custom morgan token for timestamp
morgan.token('timestamp', () => {
  return new Date().toISOString();
});

// Development logging format (console only)
const devLogger = morgan('dev');

// Production logging format (file + console)
const prodLogger = morgan(
  ':timestamp :remote-addr :method :url :status :response-time-ms ms - :res[content-length]',
  { stream: accessLogStream }
);

// Console logger for production
const consoleLogger = morgan(
  ':method :url :status :response-time-ms ms',
  {
    skip: (req) => req.path === '/api/health/ping' // Skip health checks
  }
);

// Error logger middleware
const logError = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const errorLog = `[${timestamp}] ERROR: ${req.method} ${req.url}\n` +
    `IP: ${req.ip}\n` +
    `User: ${req.user ? req.user.id : 'Anonymous'}\n` +
    `Message: ${err.message}\n` +
    `Stack: ${err.stack}\n` +
    `---\n`;
  
  errorLogStream.write(errorLog);
  console.error('❌ Error:', err.message);
  
  next(err);
};

// Security event logger
const logSecurityEvent = (event, details, req) => {
  const timestamp = new Date().toISOString();
  const securityLog = `[${timestamp}] SECURITY: ${event}\n` +
    `IP: ${req.ip}\n` +
    `User-Agent: ${req.headers['user-agent']}\n` +
    `User: ${req.user ? req.user.id : 'Anonymous'}\n` +
    `Details: ${JSON.stringify(details)}\n` +
    `---\n`;
  
  securityLogStream.write(securityLog);
  console.warn(`⚠️  Security Event: ${event}`);
};

// Suspicious activity detector
const detectSuspiciousActivity = (req, res, next) => {
  // Skip if body is empty (will be parsed later)
  if (!req.body || Object.keys(req.body).length === 0) {
    return next();
  }
  
  const suspiciousPatterns = {
    sqlInjection: /(\bor\b|\band\b).*?[=<>]/i,
    xss: /<script|javascript:|onerror=/i,
    pathTraversal: /\.\.\//,
  };
  
  const checkString = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
  });
  
  for (const [type, pattern] of Object.entries(suspiciousPatterns)) {
    if (pattern.test(checkString)) {
      logSecurityEvent(`Suspicious ${type} attempt`, {
        path: req.path,
        body: req.body,
        query: req.query,
      }, req);
      
      // In production, block suspicious requests
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Suspicious activity detected'
        });
      }
    }
  }
  
  next();
};

// Request logger (logs all incoming requests)
const requestLogger = (req, res, next) => {
  // Skip health check logs
  if (req.path === '/api/health/ping') {
    return next();
  }
  
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  
  // Log authentication attempts
  if (req.path.includes('/auth/')) {
    logSecurityEvent('Authentication attempt', {
      path: req.path,
      email: req.body.email,
      role: req.body.role,
    }, req);
  }
  
  next();
};

// Failed login tracker
const failedLoginAttempts = new Map();

const trackFailedLogin = (email, ip) => {
  const key = `${email}:${ip}`;
  const attempts = (failedLoginAttempts.get(key) || 0) + 1;
  failedLoginAttempts.set(key, attempts);
  
  // Log after 3 failed attempts
  if (attempts >= 3) {
    console.error(`🚨 Multiple failed login attempts: ${email} from ${ip}`);
  }
  
  // Clear after 1 hour
  setTimeout(() => {
    failedLoginAttempts.delete(key);
  }, 60 * 60 * 1000);
  
  return attempts;
};

const clearFailedLogin = (email, ip) => {
  const key = `${email}:${ip}`;
  failedLoginAttempts.delete(key);
};

module.exports = {
  devLogger,
  prodLogger,
  consoleLogger,
  logError,
  logSecurityEvent,
  detectSuspiciousActivity,
  requestLogger,
  trackFailedLogin,
  clearFailedLogin,
};
