const https = require('https');

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: { message: 'CLAUDE_API_KEY is not set' } });
  }

  const body = JSON.stringify(req.body);

  const options = {
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'web-search-2025-03-05',
      'Content-Length': Buffer.byteLength(body)
    }
  };

  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', chunk => data += chunk);
    response.on('end', () => {
      try {
        res.status(response.statusCode).json(JSON.parse(data));
      } catch (e) {
        res.status(500).json({ error: { message: 'Invalid response from Claude API' } });
      }
    });
  });

  request.on('error', (err) => {
    res.status(500).json({ error: { message: err.message } });
  });

  request.write(body);
  request.end();
};
