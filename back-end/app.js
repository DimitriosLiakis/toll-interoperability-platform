const express = require('express');
const cors = require('cors');

const app = express();

// Middleware for parsing JSON
app.use(cors());
app.use(express.json()); // Allows the server to parse incoming JSON data

const providerRoutes = require('./routers/provider');

app.use('/provider', providerRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('Simple root-route, PAO OLE OLE');
});

module.exports = app;
