const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware for parsing JSON
app.use(cors());
app.use(express.json()); // Allows the server to parse incoming JSON data
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/debt_figures', express.static(path.join(__dirname, 'debt_figures')));
app.use('/static', express.static(path.join(__dirname, 'public')));

// Import Routes
const passing_toll_routes = require('./routers/passing_toll_router');
const upload_passages_routes = require('./routers/upload_passages_router');
const cancel_debts = require('./routers/cancel_debts_router');
const get_figures= require('./routers/get_figures_router');
const tollStationRouter = require('./routers/tollStationsPasses_router');
const passesCost = require('./routers/passesCost_router');
const tollRouter = require('./routers/tollRouter');
const chargesBy = require('./routers/chargesBy_router');
const passAnalysis = require('./routers/passAnalysis_router')
const forecast = require('./routers/forecast_router');


// Use the routes
// --- use case 1 ---
app.use('/api/passing_toll',passing_toll_routes);
app.use('/api/upload_passages', upload_passages_routes);
app.use('/api/cancel_debts', cancel_debts);
app.use('/api/get_debts_optimization', get_figures)
//---------------------
// ---- Default Operations
app.use('/api/tollStationPasses', tollStationRouter)
app.use('/api/passesCost', passesCost)
app.use('/api/chargesBy', chargesBy);
app.use('/api/passAnalysis', passAnalysis);
// ---------------------
// ---- use Case 2 the Map ----
app.use('/api', tollRouter);
//--------------------------
// --- use Case 3 ---
app.use('/api/forecast', forecast);


// Root route
app.get('/', (req, res) => {
    res.send('Simple root-route');
});

module.exports = app;
