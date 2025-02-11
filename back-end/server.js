const fs = require('fs');
const https = require('https');
const http = require('http');
const app = require('./app'); // Import the configured Express app
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 9115;
const HTTP_PORT = 8080; // You can choose any free port for HTTP

// // Load SSL certificate
// const options = {
//     key: fs.readFileSync('./key.pem'),
//     cert: fs.readFileSync('./cert.pem'),
// };

// // Create HTTPS server
// // http.createServer(app).listen(8080);
// https.createServer(options, app).listen(PORT, () => {
//     console.log(`🚀 HTTPS Server running on port ${PORT}`);
// });
app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
});