const request = require('supertest');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Load .env from one folder up
const app = require('../app'); // Import your Express app

describe('GET /chargesBy/:tollOpID/:date_from/:date_to', () => {
  let token;

  // Generate a valid JWT token before running the tests
  beforeAll(() => {
    // Adjust the payload as required by your app's middleware/authorization logic.
    const payload = {
      username: 'admin@yme.gov.gr',
      user_role: 'admin'
    };

    // Use JWT_SECRET from environment or fallback to 'mySuperSecretKey'
    const secret = process.env.JWT_SECRET || 'mySuperSecretKey';

    token = jwt.sign(payload, secret, { expiresIn: '1h' });
  });

  it('should return 400 if required parameters are missing', async () => {
    const response = await request(app)
      .get('/api/chargesBy/')
      .set('x-observatory-auth', token);
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Missing required parameters.');
  });

  it('should return 400 if date format is invalid', async () => {
    const response = await request(app)
      .get('/api/chargesBy/AM/20221301/123')
      .set('x-observatory-auth', token);
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid date format. Use YYYYMMDD.');
  });

  it('should return 400 if the operator is invalid', async () => {
    const response = await request(app)
      .get('/api/chargesBy/INVALID/20220101/20220131')
      .set('x-observatory-auth', token);
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Error in Operator selection');
  });

  it('should return 400 if no visiting operators are found', async () => {
    const dbServiceMock = jest
      .spyOn(require('../dbService.js').prototype, 'getDebtBetween2companies')
      .mockResolvedValue([]); // Simulate no data

    const response = await request(app)
      .get('/api/chargesBy/AM/20220101/20220131')
      .set('x-observatory-auth', token);
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('No visiting operators found for the given period.');

    dbServiceMock.mockRestore();
  });

  it('should return 200 with valid JSON data when data is available', async () => {
    const mockDebtData = [
      { nPasses: 5, passesCost: 20.5 },
      { nPasses: 10, passesCost: 40.75 },
    ];

    const dbServiceMock = jest
      .spyOn(require('../dbService.js').prototype, 'getDebtBetween2companies')
      .mockResolvedValue(mockDebtData);

    const response = await request(app)
      .get('/api/chargesBy/AM/20220101/20220131')
      .set('x-observatory-auth', token);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('tollOpID', 'AM');
    expect(response.body).toHaveProperty('vOpList');
    expect(Array.isArray(response.body.vOpList)).toBe(true);

    dbServiceMock.mockRestore();
  });

  it('should return CSV data if format=csv is specified', async () => {
    const mockDebtData = [
      { nPasses: 5, passesCost: 20.5 },
      { nPasses: 10, passesCost: 40.75 },
    ];

    const dbServiceMock = jest
      .spyOn(require('../dbService.js').prototype, 'getDebtBetween2companies')
      .mockResolvedValue(mockDebtData);

    const response = await request(app)
      .get('/api/chargesBy/AM/20220101/20220131?format=csv')
      .set('x-observatory-auth', token);
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('text/csv; charset=utf-8');
    expect(response.headers['content-disposition']).toContain('attachment;');
    expect(response.text).toContain('"visitingOpID","nPasses","passesCost"'); // Check CSV headers

    dbServiceMock.mockRestore();
  });

  it('should return 500 on internal server error', async () => {
    // Suppress error logs in test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const dbServiceMock = jest
      .spyOn(require('../dbService.js').prototype, 'getDebtBetween2companies')
      .mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .get('/api/chargesBy/AM/20220101/20220131')
      .set('x-observatory-auth', token);
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Internal Server Error');

    dbServiceMock.mockRestore();
  });
});
