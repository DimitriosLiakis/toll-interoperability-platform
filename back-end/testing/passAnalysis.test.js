const request = require('supertest');
const app = require('../app'); // Import your Express app
const DbService = require('../dbService.js');
const jwt = require('jsonwebtoken');
const path = require('path');

// Load environment variables from one folder up
require('dotenv').config({ path: path.join(__dirname, '../.env') });

jest.mock('../dbService.js'); // Mock the database service

let token;
beforeAll(() => {
  // Generate a valid JWT token using the same secret and payload structure as your app
  const payload = {
    username: 'admin@yme.gov.gr',
    user_role: 'admin'
  };
  const secret = process.env.JWT_SECRET || 'mySuperSecretKey';
  token = jwt.sign(payload, secret, { expiresIn: '1h' });
});

describe('GET /api/passAnalysis/:stationOpID/:tagOpID/:date_from/:date_to', () => {
    const mockPassList = [
        {
            passID: 'P12345',
            stationID: 'S123',
            timestamp: '2023-01-15T10:30:00Z',
            tagID: 'T9876',
            passCharge: '25.50',
        },
        {
            passID: 'P67890',
            stationID: 'S456',
            timestamp: '2023-01-16T15:45:00Z',
            tagID: 'T6543',
            passCharge: '30.75',
        },
    ];

    beforeEach(() => {
        DbService.getDbServiceInstance.mockReturnValue({
            getpassAnalysis: jest.fn().mockResolvedValue(mockPassList),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if required parameters are missing', async () => {
        const response = await request(app)
            .get('/api/passAnalysis/')
            .set('x-observatory-auth', token);
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Missing required parameters.');
    });

    it('should return 400 if date format is invalid', async () => {
        const response = await request(app)
            .get('/api/passAnalysis/AM/EG/202301AB/20230116')
            .set('x-observatory-auth', token);
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid date format. Use YYYYMMDD.');
    });

    it('should return 204 if no data is available for the given range', async () => {
        DbService.getDbServiceInstance.mockReturnValue({
            getpassAnalysis: jest.fn().mockResolvedValue([]), // Simulate no data
        });
    
        const response = await request(app)
            .get('/api/passAnalysis/AM/EG/20230101/20230131')
            .set('x-observatory-auth', token);
        expect(response.status).toBe(204);
        expect(response.body).toEqual({}); // Response body should be empty
    });
    
    it('should return 200 with valid JSON data when data is available', async () => {
        const response = await request(app)
            .get('/api/passAnalysis/AM/EG/20230101/20230131')
            .set('x-observatory-auth', token);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('stationOpID', 'AM');
        expect(response.body).toHaveProperty('tagOpID', 'EG');
        expect(response.body).toHaveProperty('requestTimestamp');
        expect(response.body).toHaveProperty('periodFrom', '2023-01-01');
        expect(response.body).toHaveProperty('periodTo', '2023-01-31');
        expect(response.body).toHaveProperty('nPasses', mockPassList.length);
        expect(Array.isArray(response.body.passList)).toBe(true);
        expect(response.body.passList).toEqual(expect.arrayContaining([
            expect.objectContaining({
                passIndex: expect.any(Number),
                passID: expect.any(String),
                stationID: expect.any(String),
                timestamp: expect.any(String),
                tagID: expect.any(String),
                passCharge: expect.any(Number),
            }),
        ]));
    });

    it('should return CSV data if format=csv is specified', async () => {
        const response = await request(app)
            .get('/api/passAnalysis/AM/EG/20230101/20230131?format=csv')
            .set('x-observatory-auth', token);
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('text/csv; charset=utf-8');
        expect(response.headers['content-disposition']).toContain('attachment;');
        expect(response.text).toContain('"passIndex","passID","stationID","timestamp","tagID","passCharge"');
    });

    it('should return 500 on internal server error', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress error logs in test output
        DbService.getDbServiceInstance.mockReturnValue({
            getpassAnalysis: jest.fn().mockRejectedValue(new Error('Database error')),
        });

        const response = await request(app)
            .get('/api/passAnalysis/AM/EG/20230101/20230131')
            .set('x-observatory-auth', token);
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal server error.');
    });
});
