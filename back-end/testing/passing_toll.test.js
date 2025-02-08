// tests/passingToll.test.js (or similar file name)
const request = require('supertest');
const jwt = require('jsonwebtoken');
const path = require('path');
// Load .env file from one folder above
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('jest-extended');
const app = require('../app');

describe('PUT /api/passing_toll - Header Tests', () => {
  let token;

  // Create a valid token before tests run
  beforeAll(() => {
    // Adjust the payload as needed by your middleware and authorization logic.
    const payload = {
      username: 'admin@yme.gov.gr',
      user_role: 'admin'
    };

    // Use process.env.JWT_SECRET or fallback to the same secret used in your middleware
    const secret = process.env.JWT_SECRET || 'mySuperSecretKey';

    // Sign the token (optionally setting an expiry time)
    token = jwt.sign(payload, secret, { expiresIn: '1h' });
  });

  it('should return CSV headers when format=csv is specified', async () => {
    const response = await request(app)
      .put('/api/passing_toll?format=csv')
      .set('x-observatory-auth', token);
  
    expect([200, 204]).toContain(response.status); // Checks that response.status is in the array
  });
  

  it('should return CSV headers when format=csv is specified', async () => {
    const response = await request(app)
      .put('/api/passing_toll')
      .query({ format: 'invalid' })
      .set('x-observatory-auth', token);

    expect(response.status).toBe(400);
  });

  it('should return empty headers for 204 No Content', async () => {
    const response = await request(app)
      .put('/api/passing_toll')
      .set('x-observatory-auth', token);

    expect(response.status).toBe(204);
  });

  it('should return JSON headers for 500 Internal Server Error', async () => {
    // Suppress error logs in test output
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock the database service method to force an error
    const dbServiceMock = jest
      .spyOn(require('../dbService.js').prototype, 'getLastPassageId')
      .mockRejectedValue(new Error('Database Error'));

    const response = await request(app)
      .put('/api/passing_toll')
      .set('x-observatory-auth', token);

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Database Error');

    dbServiceMock.mockRestore();
  });
});
