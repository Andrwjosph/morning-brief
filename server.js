// server.js
// This is your backend. It keeps your API key secret and
// forwards requests from the browser to the Claude API.

const express = require('express');
const https = require('https');
const path = require('path');

const app = express();
app.use(express.json());

// Serve your index.html when someone opens http://localhost:3000
app.use(express.static(path.join(__dirname)));

// This is your one API endpoint.
// The browser calls /generate, this server calls Claude, returns the result.
app.post('/generate', (req, res) => {

  // Your Claude API key - set this in your terminal before running
  const apiKey = process.env.CLAUDE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: { message: 'No API key found. Set CLAUDE_API_KEY in your terminal.' }
    });
  }

  // Convert the request body to JSON string
  const body = JSON.stringify(req.body);

  // Options for the HTTPS request to Anthropic
  const options = {
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(body)
    }
  };

  // Make the request to Claude
  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', chunk => data += chunk);
    response.on('end', () => {
      try {
        res.json(JSON.parse(data));
      } catch(e) {
        res.status(500).json({ error: { message: 'Invalid response from Claude API' } });
      }
    });
  });

  request.on('error', (err) => {
    res.status(500).json({ error: { message: err.message } });
  });

  request.write(body);
  request.end();
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log('');
  console.log('  ☀  Morning Brief is running!');
  console.log('');
  console.log('  Open this in your browser:');
  console.log('  → http://localhost:' + PORT);
  console.log('');
  console.log('  Press Ctrl+C to stop.');
  console.log('');
});
