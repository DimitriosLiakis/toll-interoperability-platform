const express = require('express');
const cors = require('cors');

const app = express();

// Middleware for parsing JSON
app.use(cors());
app.use(express.json()); // Allows the server to parse incoming JSON data

// Import Routes
const providerRoutes = require('./routes/provider');

// Use the routes
app.use('/provider', providerRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('Simple root-route');
});

module.exports = app;
