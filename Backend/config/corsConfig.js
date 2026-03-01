/**
 * 🌐 CORS Configuration
 * Controls cross-origin resource sharing
 */

// Whitelist of allowed origins
const whitelist = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:5174', // Vite dev server (alternative port)
  'http://localhost:3000', // React dev server
  'http://localhost:3001', // Alternative React port
  'http://localhost:19006', // React Native Expo
  'https://result-portal-tkom.onrender.com', // Production backend
  // Add your production frontend URLs here
  // 'https://yourfrontend.com',
  // 'https://www.yourfrontend.com',
];

// CORS options
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in whitelist
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      
      // In production, block unknown origins
      if (process.env.NODE_ENV === 'production') {
        callback(new Error('Not allowed by CORS policy'));
      } else {
        // In development, allow all origins
        callback(null, true);
      }
    }
  },
  
  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  
  // Allowed headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  
  // Exposed headers (accessible by frontend)
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],
  
  // Allow credentials (cookies, authorization headers)
  credentials: true,
  
  // Preflight cache time (seconds)
  maxAge: 86400, // 24 hours
  
  // Pass CORS preflight response to next handler
  preflightContinue: false,
  
  // Success status code for OPTIONS requests
  optionsSuccessStatus: 204,
};

// Strict CORS for production (only whitelisted origins)
const strictCorsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error(`🚨 CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  maxAge: 86400,
};

module.exports = {
  corsOptions,
  strictCorsOptions,
  whitelist,
};
