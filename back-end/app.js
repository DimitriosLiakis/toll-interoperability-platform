const express = require('express');
const cors = require('cors');

const app = express();

// Middleware for parsing JSON
<<<<<<< HEAD
app.use(cors());
app.use(express.json()); // Allows the server to parse incoming JSON data
=======
app.use(cors({
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.use(express.json()); 

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/debt_figures', express.static(path.join(__dirname, 'debt_figures')));
app.use('/static', express.static(path.join(__dirname, 'public')));

>>>>>>> 0c65c38a6a37271c7108fb0e8a683c1e3090fb1d

// Import Routes
const passing_toll_routes = require('./routers/passing_toll_router');
const upload_passages_routes = require('./routers/upload_passages_router');
const cancel_debts = require('./routers/cancel_debts_router');
const get_figures= require('./routers/get_figures_router');
<<<<<<< HEAD
const tollStationRouter = require('./routers/tollStationsPasses_router');
=======
const tollRouter = require('./routers/tollRouter');
>>>>>>> 0c65c38a6a37271c7108fb0e8a683c1e3090fb1d


// Use the routes
app.use('/api/passing_toll', passing_toll_routes);
app.use('/api/upload_passages', upload_passages_routes);
app.use('/api/cancel_debts', cancel_debts);
<<<<<<< HEAD
app.use('/api/get_debts_optimization', get_figures)
app.use('/api/tollStationPasses', tollStationRouter)

=======
app.use('/api/get_debts_optimization', get_figures); // Mounted here
app.use('/api', tollRouter);
// Route to serve the HTML page
app.get('/debt_figures_page', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'debt_figures.html'));
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
>>>>>>> 0c65c38a6a37271c7108fb0e8a683c1e3090fb1d
// Root route
app.get('/', (req, res) => {
    res.send('Simple root-route');
});

module.exports = app;