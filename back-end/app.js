const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware for parsing JSON
app.use(cors({
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.use(express.json()); 


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/debt_figures', express.static(path.join(__dirname, 'debt_figures')));
app.use('/static', express.static(path.join(__dirname, 'public')));


const passing_toll_routes = require('./routers/passing_toll_router');
const upload_passages_routes = require('./routers/upload_passages_router');
const cancel_debts = require('./routers/cancel_debts_router');

const get_figures= require('./routers/get_figures_router');

app.use('/api/passing_toll', passing_toll_routes);
app.use('/api/upload_passages', upload_passages_routes);
app.use('/api/cancel_debts', cancel_debts);
app.use('/api/get_debts_optimization', get_figures); // Mounted here

// Route to serve the HTML page
app.get('/debt_figures_page', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'debt_figures.html'));
});

// Root route
app.get('/', (req, res) => {
    res.send('Simple root-route');
});

module.exports = app;
