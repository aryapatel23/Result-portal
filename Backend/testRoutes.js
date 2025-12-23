// Quick test to verify timetable routes are registered
const express = require('express');

const app = express();

// Simulate the same setup as server.js
app.use('/api', require('./routes/timetableRoutes'));

// List all routes
console.log('\n📋 Registered Timetable Routes:');
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`${Object.keys(middleware.route.methods)[0].toUpperCase()} /api${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    middleware.handle.stack.forEach((handler) => {
      if (handler.route) {
        const method = Object.keys(handler.route.methods)[0].toUpperCase();
        const path = handler.route.path;
        console.log(`${method} /api${path}`);
      }
    });
  }
});

console.log('\n✅ Routes loaded successfully!\n');
