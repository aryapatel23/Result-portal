const rateLimit = require('express-rate-limit');

/**
 * 🚦 Rate Limiting Protection
 * Prevents brute force attacks and API abuse
 */

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health/ping';
  },
  handler: (req, res) => {
    console.warn(`⚠️  Rate limit exceeded: ${req.ip} - ${req.path}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please slow down.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 20, // 5 in production, 20 in development
  skipSuccessfulRequests: true, // Don't count successful logins
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes'
  },
  skip: (req) => {
    // In development, skip rate limiting for localhost
    if (process.env.NODE_ENV !== 'production') {
      const isLocalhost = req.ip === '127.0.0.1' || 
                         req.ip === '::1' || 
                         req.ip === '::ffff:127.0.0.1' ||
                         req.hostname === 'localhost';
      if (isLocalhost) {
        console.log(`🔓 DEV: Skipping auth rate limit for localhost`);
        return true;
      }
    }
    return false;
  },
  handler: (req, res) => {
    console.error(`🚨 Login brute force attempt detected: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many login attempts from this IP. Account temporarily locked for 15 minutes.',
      lockoutTime: 15
    });
  }
});

// Forgot password rate limiter
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'production' ? 3 : 10, // 3 in production, 10 in development
  message: {
    success: false,
    message: 'Too many password reset attempts'
  },
  skip: (req) => {
    // In development, skip rate limiting for localhost
    if (process.env.NODE_ENV !== 'production') {
      const isLocalhost = req.ip === '127.0.0.1' || 
                         req.ip === '::1' || 
                         req.ip === '::ffff:127.0.0.1' ||
                         req.hostname === 'localhost';
      if (isLocalhost) {
        return true;
      }
    }
    return false;
  },
  handler: (req, res) => {
    console.error(`🚨 Password reset abuse detected: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many password reset requests. Please try again after 1 hour.',
      retryAfter: 3600
    });
  }
});

// File upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 uploads per 15 minutes
  message: {
    success: false,
    message: 'Too many uploads, please try again later'
  },
  handler: (req, res) => {
    console.warn(`⚠️  Upload rate limit exceeded: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many file uploads. Please wait before uploading again.'
    });
  }
});

// API key endpoints rate limiter (for sensitive operations)
const sensitiveOperationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 sensitive operations per hour
  message: {
    success: false,
    message: 'Rate limit exceeded for sensitive operations'
  },
  handler: (req, res) => {
    console.error(`🚨 Sensitive operation rate limit exceeded: ${req.ip} - ${req.path}`);
    res.status(429).json({
      success: false,
      message: 'Too many sensitive operations. Please try again later.'
    });
  }
});

// Create student/teacher rate limiter
const createUserLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 user creations per hour
  message: {
    success: false,
    message: 'Rate limit exceeded for user creation'
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  forgotPasswordLimiter,
  uploadLimiter,
  sensitiveOperationLimiter,
  createUserLimiter,
};
