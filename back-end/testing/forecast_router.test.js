/**
 * forecast_router.test.js
 *
 * Full Jest + SuperTest test suite for the /api/forecast route.
 * Mocks out database calls and Python script calls so tests run quickly.
 */

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
// Load .env from one folder up so that JWT_SECRET is available
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 1) Mock DbService, so no real DB is called
jest.mock('../dbService.js', () => {
  return {
    getDbServiceInstance: jest.fn()
  };
});
const DbService = require('../dbService.js');

// 2) Mock the child_process spawn to avoid calling Python for real
jest.mock('child_process', () => ({
  spawn: jest.fn()
}));
const { spawn } = require('child_process');

// 3) Import the router you want to test
const forecastRouter = require('../routers/forecast_router');

// ------------------
// Setup Mock Return
// ------------------
const mockDbInstance = {
  tollstations: jest.fn(),    // used by forecast_controller
  data_for_nop: jest.fn()     // used by makePassagePrediction
};
DbService.getDbServiceInstance.mockReturnValue(mockDbInstance);

// By default, let spawn return a "successful" mock process
spawn.mockImplementation(() => {
  const mockProcess = {
    stdout: {
      on: jest.fn((event, handler) => {
        if (event === 'data') {
          // We'll wait to call handler(...) in the test if needed
        }
      })
    },
    stderr: {
      on: jest.fn()
    },
    on: jest.fn((event, handler) => {
      if (event === 'close') {
        // By default, simulate successful exit code 0
        handler(0);
      }
    })
  };
  return mockProcess;
});

// ------------------
// Minimal App Setup
// ------------------
const app = express();
app.use(express.json());
app.use('/api/forecast', forecastRouter);

// ------------------
// Generate JWT Token for Testing
// ------------------
let token;
beforeAll(() => {
  // Adjust the payload as required by your middleware/authorization logic.
  const payload = {
    username: 'admin@yme.gov.gr',
    user_role: 'admin'
  };
  const secret = process.env.JWT_SECRET || 'mySuperSecretKey';
  token = jwt.sign(payload, secret, { expiresIn: '1h' });
});

// ------------------
// Tests
// ------------------
describe('GET /api/forecast/:company_id?/:date?', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCENARIO 1: Missing parameters => 400
  it('should return 400 if company_id or date are missing', async () => {
    // e.g. call /api/forecast with no params
    const response = await request(app)
      .get('/api/forecast/')
      .set('x-observatory-auth', token);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Missing required parameters');
  });

  // SCENARIO 2: Invalid date format => 400
  it('should return 400 for invalid date format', async () => {
    // "2021-01-01" doesn't match YYYYMMDD
    const response = await request(app)
      .get('/api/forecast/AM/2021-01-01')
      .set('x-observatory-auth', token);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Invalid date format. Use YYYYMMDD.');
  });

  // SCENARIO 3: No toll stations => 204
  // If tollstations() returns [] or null, the controller sends 204
  it('should return 204 if no toll stations found for the company', async () => {
    mockDbInstance.tollstations.mockResolvedValueOnce([]); // or null
    const response = await request(app)
      .get('/api/forecast/ZZ/20210101')
      .set('x-observatory-auth', token);
    expect(response.status).toBe(204);
    // 204 means No Content, so typically no body is returned
    expect(response.body).toEqual({});
  });

  // SCENARIO 4: No data_for_nop => 204
  // Even if toll stations exist, if data_for_nop returns null, we get 204 in makePassagePrediction
  it('should return 204 if no data_for_nop for the company', async () => {
    // First call: tollstations => some data
    mockDbInstance.tollstations.mockResolvedValueOnce([
      { Toll_id: 'T001' }
    ]);
    // Second call: data_for_nop => null => 204
    mockDbInstance.data_for_nop.mockResolvedValueOnce(null);

    const response = await request(app)
      .get('/api/forecast/AM/20210101')
      .set('x-observatory-auth', token);
    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  // SCENARIO 5: Python script fails => 500
  // If the script exits with code != 0, we return 500
  it('should return 500 if Python script exits with non-zero code', async () => {
    mockDbInstance.tollstations.mockResolvedValueOnce([
      { Toll_id: 'T001' }
    ]);
    mockDbInstance.data_for_nop.mockResolvedValueOnce([{ some: 'data' }]);

    // Force spawn to simulate error exit code 1
    spawn.mockImplementationOnce(() => {
      const mockProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, handler) => {
          if (event === 'close') {
            handler(1); // code=1 => error
          }
        })
      };
      return mockProcess;
    });

    const response = await request(app)
      .get('/api/forecast/AM/20210101')
      .set('x-observatory-auth', token);
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Error making predictions');
  });

  // SCENARIO 6: Successful Prediction => 200 + JSON
  it('should return 200 and JSON array if predictions exist', async () => {
    mockDbInstance.tollstations.mockResolvedValueOnce([
      { Toll_id: 'T001' }
    ]);
    mockDbInstance.data_for_nop.mockResolvedValueOnce([{ some: 'data' }]);

    // Let's simulate the Python script output
    // We'll intercept the "on('data', ...)" callback and feed it JSON
    spawn.mockImplementationOnce(() => {
      const mockProcess = {
        stdout: {
          on: jest.fn((event, handler) => {
            if (event === 'data') {
              // Provide a JSON string for predictions
              handler(JSON.stringify([
                { passage_date: '2021-01-01', predicted_passages: 123 }
              ]));
            }
          })
        },
        stderr: { on: jest.fn() },
        on: jest.fn((event, handler) => {
          if (event === 'close') {
            // Simulate exit code 0 => success
            handler(0);
          }
        })
      };
      return mockProcess;
    });

    const response = await request(app)
      .get('/api/forecast/AM/20210101')
      .set('x-observatory-auth', token);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty('passage_date');
      expect(response.body[0]).toHaveProperty('predicted_passages');
    }
  });

  // SCENARIO 7: Successful Prediction => 200 + CSV
  it('should return 200 and CSV file if format=csv', async () => {
    mockDbInstance.tollstations.mockResolvedValueOnce([
      { Toll_id: 'T001' }
    ]);
    mockDbInstance.data_for_nop.mockResolvedValueOnce([{ some: 'data' }]);
  
    spawn.mockImplementationOnce(() => {
      const mockProcess = {
        stdout: {
          on: jest.fn((event, handler) => {
            if (event === 'data') {
              // Provide a JSON string for predictions
              handler(JSON.stringify([
                { passage_date: '2021-01-01', predicted_passages: 123 }
              ]));
            }
          })
        },
        stderr: { on: jest.fn() },
        on: jest.fn((event, handler) => {
          if (event === 'close') {
            handler(0);
          }
        })
      };
      return mockProcess;
    });
  
    const response = await request(app)
      .get('/api/forecast/AM/20210101?format=csv')
      .set('x-observatory-auth', token);
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('text/csv');
  
    // Match the headers that are actually in your CSV
    expect(response.text).toMatch(/"passage_date","predicted_passages"/);
  
    // Match the row data
    expect(response.text).toMatch(/"2021-01-01",123/);
  });
});
