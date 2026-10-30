// Step 1: Import Node.js built-in 'http' module using CommonJS
const http = require('http');

// Step 2: Define the port number where the server will listen
const PORT = 3000;

// Step 3: Create the HTTP server using http.createServer()
// The callback function is triggered automatically whenever a request reaches the server
const server = http.createServer((req, res) => {
  // Log the incoming request method and URL in the console for visibility
  console.log(`Received ${req.method} request for: ${req.url}`);

  // Step 4 & 5: Set HTTP status code 200 (OK) and headers (Content-Type: text/plain)
  res.writeHead(200, { 'Content-Type': 'text/plain' });

  // Step 6: Send the response body "Hello" and close the response stream
  res.end('Hello');
});

// Step 7: Start the server and listen on the defined port
server.listen(PORT, () => {
  console.log(`Plain Node.js HTTP server is running at http://localhost:${PORT}`);
  console.log('Press Ctrl + C to stop the server.');
});
