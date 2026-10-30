// Step 1: Import Express framework using CommonJS syntax
const express = require('express');

// Step 2: Initialize the Express application
const app = express();

// Step 3: Define the port using environment variable or default to 3000
// This is essential for deployment environments like Vercel or cloud providers
const PORT = process.env.PORT || 3000;

// ==========================================
// MANDATORY ROUTE DEFINITIONS
// ==========================================

// Route 1: GET / - Welcome message
app.get('/', (req, res) => {
  // res.status(200) explicitly sets HTTP 200 OK status code
  res.status(200).send('Welcome to Backend Development Fundamentals - Lab 1 Express Server!');
});

// Route 2: GET /about - Student profile information as JSON
app.get('/about', (req, res) => {
  // Returns student details in JSON format
  res.status(200).json({
    name: 'ROHAN PEDAPAGA',
    registrationNumber: '252U1R1188',
    section: 'CSE-2D (214)'
  });
});

// Route 3: GET /time - Dynamic current date and time using new Date()
app.get('/time', (req, res) => {
  const now = new Date();
  res.status(200).json({
    currentTime: now.toISOString(),
    humanReadable: now.toString()
  });
});

// ==========================================
// CUSTOM 404 NOT FOUND MIDDLEWARE
// ==========================================
// This middleware runs only if no previous route matched the requested URL
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// ==========================================
// LOCAL EXECUTION & VERCEL EXPORT
// ==========================================
// Start listening only when executed directly (node index.js / nodemon index.js)
// When imported as a serverless function module on Vercel, app is exported without port conflicts
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Express server is running at http://localhost:${PORT}`);
    console.log(`Available routes:`);
    console.log(` - GET  http://localhost:${PORT}/`);
    console.log(` - GET  http://localhost:${PORT}/about`);
    console.log(` - GET  http://localhost:${PORT}/time`);
    console.log('Press Ctrl + C to stop the server.');
  });
}

// Export the Express app instance for Vercel deployment
module.exports = app;
