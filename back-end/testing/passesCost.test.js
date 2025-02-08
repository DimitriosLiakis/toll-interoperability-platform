const request = require('supertest');
const app = require('../app'); // Import your Express app
const jwt = require('jsonwebtoken');
const path = require('path');

// Load environment variables from one folder up so that JWT_SECRET is available
require('dotenv').config({ path: path.join(__dirname, '../.env') });

jest.mock('../dbService.js'); // Mock the dbService
const mockDbService = require('../dbService.js');

let token;
beforeAll(() => {
  // Generate a valid JWT token using the secret and payload your middleware expects.
  const payload = {
    username: 'admin@yme.gov.gr',
    user_role: 'admin'
  };
  const secret = process.env.JWT_SECRET || 'mySuperSecretKey';
  token = jwt.sign(payload, secret, { expiresIn: '1h' });
});

describe('GET /api/passesCost/:tollOpID/:tagOpID/:date_from/:date_to', () => {
  it('should return 400 if required parameters are missing', async () => {
    const response = await request(app)
      .get('/api/passesCost/')
      .set('x-observatory-auth', token);
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Missing required parameters.');
  });
  
  it('should return 400 if date format is invalid', async () => {
    const mockGetPassesBetween2companies = jest.fn();
    mockDbService.getDbServiceInstance = jest.fn(() => ({
      getPassesBetween2companies: mockGetPassesBetween2companies,
    }));
    const response = await request(app)
      .get('/api/passesCost/AM/NAO/2022-01-01/2022-01-31')
      .set('x-observatory-auth', token);
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid date format. Use YYYYMMDD.');
  });

  it('should return 204 if no data is available for the given range', async () => {
    const mockGetPassesBetween2companies = jest.fn();
    mockDbService.getDbServiceInstance = jest.fn(() => ({
      getPassesBetween2companies: mockGetPassesBetween2companies,
    }));
    mockGetPassesBetween2companies.mockResolvedValue({ nPasses: 0, passesCost: 0 });

    const response = await request(app)
      .get('/api/passesCost/AM/NAO/20220101/20220131')
      .set('x-observatory-auth', token);
    expect(response.status).toBe(204); // No Content
    expect(response.text).toBe('');
  });

  it('should return 200 with valid JSON data when data is available', async () => {
    const mockGetPassesBetween2companies = jest.fn();
    mockDbService.getDbServiceInstance = jest.fn(() => ({
      getPassesBetween2companies: mockGetPassesBetween2companies,
    }));
    mockGetPassesBetween2companies.mockResolvedValue({ nPasses: 10, passesCost: 50 });

    const response = await request(app)
      .get('/api/passesCost/AM/NAO/20220101/20220131')
      .set('x-observatory-auth', token);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('tollOpID');
    expect(response.body).toHaveProperty('tagOpID');
    expect(response.body).toHaveProperty('requestTimestamp');
    expect(response.body).toHaveProperty('periodFrom');
    expect(response.body).toHaveProperty('periodTo');
    expect(response.body).toHaveProperty('nPasses');
    expect(response.body).toHaveProperty('passesCost');
  });

  it('should return CSV data if format=csv is specified', async () => {
    const response = await request(app)
      .get('/api/passesCost/AM/NAO/20220101/20220131?format=csv')
      .set('x-observatory-auth', token);
    
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('text/csv; charset=utf-8');
    expect(response.headers['content-disposition']).toContain('attachment;');
    
    // Verify that the CSV response contains the expected header columns.
    expect(response.text).toContain('"tollOpID","tagOpID","requestTimestamp","periodFrom","periodTo","nPasses","passesCost"');
  });
});
