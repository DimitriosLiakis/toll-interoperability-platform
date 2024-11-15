const express = require('express');
const cors = require('cors');

const app = express();

// Middleware for parsing JSON
app.use(cors());
app.use(express.json()); // Allows the server to parse incoming JSON data

// Import Routes
const passing_toll_routes = require('./routers/passing_toll_router')
// Use the routes
app.use('/api/passing_toll', passing_toll_routes);
// Root route
app.get('/', (req, res) => {
    res.send('Simple root-route');
});

module.exports = app;