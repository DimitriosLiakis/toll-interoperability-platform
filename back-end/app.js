const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/debt_figures', express.static(path.join(__dirname, 'debt_figures')));
app.use('/static', express.static(path.join(__dirname, 'public')));

// Swagger Configuration
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'This is the API documentation generated from JSDoc comments.',
        },
        servers: [
            {
                url: 'http://localhost:9115/api',
                description: 'Development server',
            },
        ],
    },
    apis: [path.join(__dirname, 'routers', '*.js')], // Make sure this path matches your project structure
};

// Generate Swagger Docs
const specs = swaggerJsdoc(options);

// Serve Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));


const openapiFilePath = path.join(__dirname, 'openapi.json');

// Serve OpenAPI JSON
app.get('/api/openapi.json', (req, res) => {
    try {
        // Generate and save OpenAPI JSON file
        fs.writeFileSync(openapiFilePath, JSON.stringify(specs, null, 2), 'utf8');
        console.log('✅ OpenAPI JSON file has been saved at:', openapiFilePath);

        // Send the JSON response
        res.setHeader('Content-Type', 'application/json');
        res.json(specs);
    } catch (error) {
        console.error('❌ Error saving OpenAPI JSON:', error);
        res.status(500).json({ error: 'Failed to generate and save OpenAPI JSON.' });
    }
});


// Import Routes
const passing_toll_routes = require('./routers/passing_toll_router');
const upload_passages_routes = require('./routers/upload_passages_router');
const cancel_debts = require('./routers/cancel_debts_router');
const get_figures = require('./routers/get_figures_router');
const tollStationRouter = require('./routers/tollStationsPasses_router');
const passesCost = require('./routers/passesCost_router');
const tollRouter = require('./routers/tollRouter');
const chargesBy = require('./routers/chargesBy_router');
const passAnalysis = require('./routers/passAnalysis_router');
const forecast = require('./routers/forecast_router');
const authRouter = require('./routers/auth_router');
const training = require('./routers/training_router');
const peak_hour = require('./routers/peak_hour_router');
const adminRouter = require('./routers/admin_router');

// Use routes
app.use('/api/passing_toll', passing_toll_routes);
app.use('/api/upload_passages', upload_passages_routes);
app.use('/api/cancel_debts', cancel_debts);
app.use('/api/get_debts_optimization', get_figures);
app.use('/api/tollStationPasses', tollStationRouter);
app.use('/api/passesCost', passesCost);
app.use('/api/chargesBy', chargesBy);
app.use('/api/passAnalysis', passAnalysis);
app.use('/api', authRouter);
app.use('/api', tollRouter);
app.use('/api/forecast', forecast);
app.use('/api/peak_hour', peak_hour);
app.use('/api/training', training);
app.use('/api/admin', adminRouter);

// Root route
app.get('/', (req, res) => {
    res.send('Simple root-route');
});

// Invalid API endpoint handler
app.use('/api/*', (req, res) => {
    res.status(400).json({ error: 'Invalid API endpoint' });
});

// Catch-all 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

module.exports = app;
