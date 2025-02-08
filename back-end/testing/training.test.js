const request = require('supertest');
const express = require('express');
const router = require('../routers/training_router'); // Adjust to your actual path
const jwt = require('jsonwebtoken');
const path = require('path');

// Load environment variables for JWT_SECRET
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Mock modules
jest.mock('../dbService.js');
jest.mock('child_process', () => ({
  spawn: jest.fn(),
}));

// Import mocks
const DbService = require('../dbService.js');
const { spawn } = require('child_process');

// Setup Express app
const app = express();
app.use(express.json());
app.use('/api/training', router);

// Generate JWT token for authentication
let token;
beforeAll(() => {
  const payload = { username: 'admin@yme.gov.gr', user_role: 'admin' };
  const secret = process.env.JWT_SECRET || 'mySuperSecretKey';
  token = jwt.sign(payload, secret, { expiresIn: '1h' });
});

// Default mock behaviors
DbService.getDbServiceInstance.mockReturnValue({
  data_for_nop: jest.fn().mockResolvedValue([]),
});

spawn.mockImplementation(() => {
  const mockProcess = {
    stdout: { on: jest.fn() },
    stderr: { on: jest.fn() },
    on: jest.fn((event, handler) => {
      if (event === 'close') {
        handler(0);
      }
    }),
  };
  return mockProcess;
});

// Test Suite
describe('POST /api/training', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 when training completes successfully for all companies', async () => {
    const mockDb = DbService.getDbServiceInstance();
    mockDb.data_for_nop
      .mockResolvedValueOnce([{ passage_date: '2023-01-01', passages: 50 }])
      .mockResolvedValueOnce([{ passage_date: '2023-01-01', passages: 60 }])
      .mockResolvedValueOnce([{ passage_date: '2023-01-01', passages: 70 }])
      .mockResolvedValueOnce([{ passage_date: '2023-01-01', passages: 80 }])
      .mockResolvedValueOnce([{ passage_date: '2023-01-01', passages: 90 }])
      .mockResolvedValueOnce([{ passage_date: '2023-01-01', passages: 100 }])
      .mockResolvedValueOnce([{ passage_date: '2023-01-01', passages: 110 }])
      .mockResolvedValueOnce([{ passage_date: '2023-01-01', passages: 120 }]);

    spawn.mockImplementationOnce(() => {
      const mockProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, handler) => {
          if (event === 'close') {
            handler(0);
          }
        }),
      };
      return mockProcess;
    });

    const response = await request(app)
      .post('/api/training')
      .set('x-observatory-auth', token)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Training completed successfully');
  });

  it('should return 404 when data is missing for one or more companies', async () => {
    const mockDb = DbService.getDbServiceInstance();
    mockDb.data_for_nop
      .mockResolvedValueOnce([{ passage_date: '2023-01-01', passages: 50 }])
      .mockResolvedValueOnce(null);

    const response = await request(app)
      .post('/api/training')
      .set('x-observatory-auth', token)
      .send();

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('error', 'Data missing for one or more companies');
    expect(Array.isArray(response.body.details)).toBe(true);
    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ company: 'EG', error: 'No data found' }),
      ])
    );
  });

  it('should return 500 if the Python training script fails', async () => {
    const mockDb = DbService.getDbServiceInstance();
    mockDb.data_for_nop.mockResolvedValue([{ passage_date: '2023-01-01', passages: 50 }]);

    spawn.mockImplementationOnce(() => {
      const mockProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, handler) => {
          if (event === 'close') {
            handler(1);
          }
        }),
      };
      return mockProcess;
    });

    const response = await request(app)
      .post('/api/training')
      .set('x-observatory-auth', token)
      .send();

    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty('error', 'Internal server error');
  });
});
