const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

/**
 * 🛡️ Comprehensive Security Middleware
 * Protects against common web vulnerabilities
 */

// Helmet - Security Headers Protection
const helmetConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  // Cross Origin Embedder Policy
  crossOriginEmbedderPolicy: false, // Allow cross-origin resources
  // Cross Origin Resource Policy
  crossOriginResourcePolicy: { policy: "cross-origin" },
  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },
  // Frame Guard - Prevent clickjacking
  frameguard: { action: 'deny' },
  // Hide Powered By Header
  hidePoweredBy: true,
  // HSTS - Force HTTPS
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  // IE No Open - Prevent IE from executing downloads
  ieNoOpen: true,
  // No Sniff - Prevent MIME type sniffing
  noSniff: true,
  // Referrer Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  // XSS Filter
  xssFilter: true,
});

// MongoDB Injection Protection
const mongoSanitizeConfig = mongoSanitize({
  replaceWith: '_', // Replace $ and . with _
  onSanitize: ({ req, key }) => {
    console.warn(`⚠️  NoSQL injection attempt detected: ${key}`);
  },
});

// HTTP Parameter Pollution Protection
const hppConfig = hpp({
  whitelist: [
    'standard', 'className', 'role', 'status', 'term',
    'subject', 'date', 'marks', 'attendance', 'sort'
  ] // Allow duplicate parameters for filtering/sorting
});

// Custom security headers
const customSecurityHeaders = (req, res, next) => {
  // Remove sensitive headers
  res.removeHeader('X-Powered-By');
  
  // Add custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Permissions-Policy', 'geolocation=(self), microphone=(), camera=()');
  
  next();
};

// Request sanitizer - Clean all inputs
const sanitizeRequest = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Remove potential XSS
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
    });
  }
  next();
};

// Prevent common attacks
const preventCommonAttacks = (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  
  // Block known malicious patterns
  const maliciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /acunetix/i,
  ];
  
  if (maliciousPatterns.some(pattern => pattern.test(userAgent))) {
    console.error('🚨 Malicious user agent detected:', userAgent);
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  next();
};

module.exports = {
  helmetConfig,
  mongoSanitizeConfig,
  hppConfig,
  customSecurityHeaders,
  sanitizeRequest,
  preventCommonAttacks,
};
