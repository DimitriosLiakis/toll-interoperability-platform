const request = require('supertest');
const app = require('../app'); // Import your Express app
const jwt = require('jsonwebtoken');
const path = require('path');

// Load environment variables to get JWT_SECRET
require('dotenv').config({ path: path.join(__dirname, '../.env') });

let token;
beforeAll(() => {
  const payload = { username: 'admin@yme.gov.gr', user_role: 'admin' };
  const secret = process.env.JWT_SECRET || 'mySuperSecretKey';
  token = jwt.sign(payload, secret, { expiresIn: '1h' });
});

describe('GET /api/tollStationPasses/:tollStationID/:date_from/:date_to', () => {
  // Test 400 for missing parameters
  it('should return 400 if required parameters are missing', async () => {
    const response = await request(app)
      .get('/api/tollStationPasses/')
      .set('x-observatory-auth', token);
    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Missing required parameters/);
  });

  // Test 400 for invalid tollStationID (wrong prefix)
  it('should return 400 if tollStationID has invalid prefix', async () => {
    const response = await request(app)
      .get('/api/tollStationPasses/XX99/20220101/20220102')
      .set('x-observatory-auth', token);
    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Wrong required parameter tollStationID/);
  });

  // Test 400 for tollStationID too short
  it('should return 400 if tollStationID is too short', async () => {
    const response = await request(app)
      .get('/api/tollStationPasses/NO/20220101/20220102')
      .set('x-observatory-auth', token);
    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Wrong required parameter tollStationID/);
  });

  // Test 204 when no data found
  it('should return 204 if no passes exist in date range', async () => {
    const response = await request(app)
      .get('/api/tollStationPasses/NO01/29990101/29990102')
      .set('x-observatory-auth', token);
    expect(response.status).toBe(204);
  });

  it('should return 200 with JSON data when passes exist', async () => {
    const response = await request(app)
      .get('/api/tollStationPasses/NAO04/20220425/20220506')
      .set('x-observatory-auth', token);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('passList');
    expect(Array.isArray(response.body.passList)).toBe(true);
    
    response.body.passList.forEach(pass => {
      expect(pass).toMatchObject({
        passIndex: expect.any(Number),
        passID: expect.any(Number), // Ensure passID is a string
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/),
        tagID: expect.any(String),
        tagProvider: expect.any(String),
        passType: expect.stringMatching(/home|visitor/),
        passCharge: expect.any(Number)
      });
    });
  });
  // Update CSV test expectation:
it('should return CSV data when format=csv', async () => {
  const response = await request(app)
    .get('/api/tollStationPasses/NAO04/20220425/20220506?format=csv')
    .set('x-observatory-auth', token);
  
  expect(response.status).toBe(200);
  expect(response.headers['content-type']).toMatch(/text\/csv/);
  // Check for quoted headers
  expect(response.text).toContain('"passIndex","passID","timestamp","tagID","tagProvider","passType","passCharge"');
});
});