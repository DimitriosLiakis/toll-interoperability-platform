const request = require('supertest');
const app = require('../app'); // Import your Express app
const jwt = require('jsonwebtoken');
const path = require('path');

// Load environment variables from one folder up so that JWT_SECRET is available.
require('dotenv').config({ path: path.join(__dirname, '../.env') });

let token;
beforeAll(() => {
  // Generate a valid JWT token with the payload expected by your middleware.
  const payload = {
    username: 'admin@yme.gov.gr',
    user_role: 'admin'
  };
  const secret = process.env.JWT_SECRET || 'mySuperSecretKey';
  token = jwt.sign(payload, secret, { expiresIn: '1h' });
});

describe('GET /api/tollStationPasses/:tollStationID/:date_from/:date_to', () => {
    it('should return 400 if required parameters are missing', async () => {
        const response = await request(app)
          .get('/api/tollStationPasses/')
          .set('x-observatory-auth', token);
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Missing required parameters: tollStationID, date_from, date_to');
    });

    it('should return 400 if date format is invalid', async () => {
        const response = await request(app)
          .get('/api/tollStationPasses/NO03/20231301/123')
          .set('x-observatory-auth', token);
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid date format. Expected YYYYMMDD.');
    });

    it('should return 204 if no data is available for the given range', async () => {
        const response = await request(app)
          .get('/api/tollStationPasses/NO03/20240101/20240101')
          .set('x-observatory-auth', token);
        expect(response.status).toBe(204); // No Content
    });

    it('should return 200 with valid JSON data when data is available', async () => {
        const response = await request(app)
          .get('/api/tollStationPasses/NO03/20220101/20220103')
          .set('x-observatory-auth', token);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('stationID', 'NO03');
        expect(response.body).toHaveProperty('stationOperator');
        expect(response.body).toHaveProperty('requestTimestamp');
        expect(response.body).toHaveProperty('periodFrom', '2022-01-01');
        expect(response.body).toHaveProperty('periodTo', '2022-01-03');
        expect(response.body).toHaveProperty('nPasses');
        expect(response.body).toHaveProperty('passList');
        expect(Array.isArray(response.body.passList)).toBe(true);
    });

    it('should return CSV data if format=csv is specified', async () => {
        const response = await request(app)
          .get('/api/tollStationPasses/NO03/20220101/20220103?format=csv')
          .set('x-observatory-auth', token);
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('text/csv; charset=utf-8');
        expect(response.headers['content-disposition']).toContain('attachment;');
        expect(response.text).toContain('"passIndex","passID","timestamp","tagID","tagProvider","passType","passCharge"');
    });
});
