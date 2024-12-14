const express = require('express');
const cors = require('cors');

const app = express();

// Middleware for parsing JSON
app.use(cors());
app.use(express.json()); // Allows the server to parse incoming JSON data

// Import Routes
const passing_toll_routes = require('./routers/passing_toll_router');
const upload_passages_routes = require('./routers/upload_passages_router');
const cancel_debts = require('./routers/cancel_debts_router');
const get_figures= require('./routers/get_figures_router');
const tollStationRouter = require('./routers/tollStationsPasses_router');


// Use the routes
app.use('/api/passing_toll', passing_toll_routes);
app.use('/api/upload_passages', upload_passages_routes);
app.use('/api/cancel_debts', cancel_debts);
app.use('/api/get_debts_optimization', get_figures)
app.use('/api/tollStationPasses', tollStationRouter)

// Root route
app.get('/', (req, res) => {
    res.send('Simple root-route');
});

module.exports = app;