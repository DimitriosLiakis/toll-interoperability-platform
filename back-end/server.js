const app = require('./app'); // Import the configured Express app
const dotenv = require('dotenv');
dotenv.config();

// Define a port to listen on
const PORT = process.env.PORT || 9115;

// Start the server
app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
});