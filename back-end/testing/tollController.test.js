const request = require('supertest');
const express = require('express');

// Mock the getTolls controller
jest.mock('../controllers/tollController', () => {
    const actualController = jest.requireActual('../controllers/tollController');
    return {
        ...actualController,
        getTolls: jest.fn(),
    };
});

const { getTolls } = require('../controllers/tollController');

const app = express();

// Middleware to handle errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Route for getTolls
app.get('/api/tolls', (req, res, next) => {
    try {
        if (!['json', 'csv'].includes(req.query.format)) {
            return res.status(400).json({ error: 'Invalid format parameter. Allowed values are "json" or "csv".' });
        }
        getTolls(req, res, next);
    } catch (error) {
        next(error);
    }
});

// Mock datasets
const mockCsvData = [
    {
        operator: 'aegeanmotorway',
        tollId: 'AM01',
        name: 'Test Toll 1',
        latitude: 40.0,
        longitude: 20.0,
        email: 'test@example.com',
        prices: ['1.00', '2.00', '3.00', '4.00'],
    },
    {
        operator: 'aegeanmotorway',
        tollId: 'AM02',
        name: 'Test Toll 2',
        latitude: 41.0,
        longitude: 21.0,
        email: 'test2@example.com',
        prices: ['2.00', '3.00', '4.00', '5.00'],
    },
];

// Suite 1: Testing regular scenarios
describe('GET /api/tolls - Regular Scenarios', () => {
    beforeEach(() => {
        jest.resetModules();
        getTolls.mockImplementation((req, res) => res.json(mockCsvData));
    });

    it('should return data from mock CSV data when format is json', async () => {
        const response = await request(app).get('/api/tolls').query({ format: 'json' });

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body).toEqual(mockCsvData);
    });

    it('should return data from mock CSV data in CSV format', async () => {
        getTolls.mockImplementation((req, res) => {
            res.set('Content-Type', 'text/csv');
            res.send(
                `"operator","tollId","name","latitude","longitude","email","prices"\n` +
                    mockCsvData
                        .map(
                            (toll) =>
                                `"${toll.operator}","${toll.tollId}","${toll.name}",${toll.latitude},${toll.longitude},"${toll.email}","${toll.prices.join(
                                    ','
                                )}"`
                        )
                        .join('\n')
            );
        });

        const response = await request(app).get('/api/tolls').query({ format: 'csv' });

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/text\/csv/);
        expect(response.text).toContain('"operator","tollId","name","latitude","longitude","email","prices"');
    });

    it('should return 400 Bad Request for invalid format', async () => {
        const response = await request(app).get('/api/tolls').query({ format: 'invalid' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid format parameter. Allowed values are "json" or "csv".' });
    });
});

// Suite 2: Testing edge and error cases
describe('GET /api/tolls - Edge Cases and Errors', () => {
    beforeEach(() => {
        jest.resetModules(); // Reset modules before each test
        getTolls.mockReset(); // Reset the mock implementation for getTolls
    });

    it('should return 204 No Content when no toll data is available', async () => {
        // Mock getTolls to simulate no content
        getTolls.mockImplementation((req, res) => res.status(204).send());

        const response = await request(app).get('/api/tolls').query({ format: 'json' });

        expect(response.status).toBe(204);
        expect(response.body).toEqual({}); // No content should return an empty body
    });

    it('should return 500 Internal Server Error for unexpected server error', async () => {
        // Mock getTolls to throw an error
        getTolls.mockImplementation(() => {
            throw new Error('Unexpected server error');
        });

        const response = await request(app).get('/api/tolls').query({ format: 'json' });

        expect(response.status).toBe(500);
    });
});

