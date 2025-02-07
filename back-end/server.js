const https = require('https');
const http = require('http');
const fs = require('fs');
const app = require('./app');
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 9115;

// Read SSL certificate
let sslOptions;
try {
  sslOptions = {
    key: fs.readFileSync(process.env.SSL_KEY_PATH || './key.pem'),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH || './cert.pem')
  };
} catch (err) {
  console.error('Error reading SSL certificate files:', err.message);
  process.exit(1);
}

// Create HTTPS server
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`HTTPS Server running on port ${PORT}`);
});

// Optional: Redirect HTTP to HTTPS in production
if (process.env.NODE_ENV === 'production') {
  http.createServer((req, res) => {
    res.writeHead(301, { 'Location': `https://${req.headers.host}${req.url}` });
    res.end();
  }).listen(80, () => {
    console.log('HTTP redirect server running on port 80');
  });
}
