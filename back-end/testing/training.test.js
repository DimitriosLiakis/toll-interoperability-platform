/**
 * tests/training_router.test.js
 *
 * Example Jest + SuperTest test suite for the training router.
 * This demonstrates:
 *  1) How to mock DbService so your tests do not rely on a real DB.
 *  2) How to mock the `spawn` function to avoid actually calling Python.
 *  3) How to assert HTTP status codes and responses for both success and error cases.
 */

const request = require('supertest');
const express = require('express');
const router = require('../routers/training_router'); // Adjust to your actual path

// We will mock these modules so they don't perform real operations:
jest.mock('../dbService.js');
jest.mock('child_process', () => ({
  spawn: jest.fn()
}));

// Now import the mocks so we can control them
const DbService = require('../dbService.js');
const { spawn } = require('child_process');

// ----------------------------------------------------------------------------
// Create a minimal app that uses the router under test
// ----------------------------------------------------------------------------
const app = express();
app.use(express.json());
app.use('/api/training', router);

/**
 * Because your router POSTs to '/', the full route is /api/training/
 * We'll call that in our tests.
 */

// ----------------------------------------------------------------------------
// Setup default mock behaviors
// ----------------------------------------------------------------------------

// Mock the DB service instance method. You call `DbService.getDbServiceInstance()` 
// in your code, so we'll ensure that returns the correct object with the needed methods.
DbService.getDbServiceInstance.mockReturnValue({
  // Called in training_controller
  data_for_nop: jest.fn().mockResolvedValue([]), // We'll override in specific tests
});

// Mock the child_process spawn so it doesn't actually spawn Python.
spawn.mockImplementation(() => {
  // Return a mock "ChildProcess" that emits events
  const mockProcess = {
    stdout: {
      on: jest.fn((event, handler) => {
        if (event === 'data') {
          // We can invoke handler(...) to simulate Python script output
        }
      }),
    },
    stderr: {
      on: jest.fn(),
    },
    on: jest.fn((event, handler) => {
      if (event === 'close') {
        // We can call handler(0) to simulate exit code 0
      }
    }),
  };
  return mockProcess;
});

// ----------------------------------------------------------------------------
// Test Suite
// ----------------------------------------------------------------------------
describe('POST /api/training', () => {
  beforeEach(() => {
    // Reset mocks before each test so we start fresh
    jest.clearAllMocks();
  });

  /**
   * 1) Success path:
   *    - The DB returns valid data for all companies.
   *    - The Python script "finishes" with exit code 0.
   *    - We expect a 200 (or whichever status you send in success).
   */
  it('should return 200 when training completes successfully for all companies', async () => {
    // Set up the DB mock to return "valid" data for all companies
    const mockDb = DbService.getDbServiceInstance();
    mockDb.data_for_nop.mockResolvedValueOnce([{ passage_date: '2023-01-01', passages: 50 }]) // AM
                       .mockResolvedValueOnce([{ passage_date: '2023-01-01', passages: 60 }]) // EG
                       .mockResolvedValueOnce([{ passage_date: '2023-01-01', passages: 70 }]) // GE
                       .mockResolvedValueOnce([{ passage_date: '2023-01-01', passages: 80 }]) // KO
                       .mockResolvedValueOnce([{ passage_date: '2023-01-01', passages: 90 }]) // MO
                       .mockResolvedValueOnce([{ passage_date: '2023-01-01', passages: 100 }])// NAO
                       .mockResolvedValueOnce([{ passage_date: '2023-01-01', passages: 110 }])// NO
                       .mockResolvedValueOnce([{ passage_date: '2023-01-01', passages: 120 }]); // OO

    // Make spawn call behave as if the Python script succeeded
    spawn.mockImplementationOnce(() => {
      const mockProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, handler) => {
          if (event === 'close') {
            // Simulate exit code 0
            handler(0);
          }
        }),
      };
      return mockProcess;
    });

    // Because the training_controller code is currently commented out where it sends the final response,
    // we might need to re-introduce something like:
    //    return res.status(200).json({ message: 'Models trained successfully for all companies' });
    // For demonstration, let's assume we've re-enabled that line.

    // Similarly, the router code that eventually sends res.status(200)... is also commented out.
    // We'll assume you've uncommented:
    //   return res.status(200).json({ message: 'Training completed successfully' });

    const response = await request(app).post('/api/training').send();

    // If your route is not sending a response after success, the request might hang or get a 500.
    // Make sure the training_controller or the route eventually calls res.status(200).json(...)
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Training completed successfully');
  });

  /**
   * 2) Some companies missing data => 404
   *    - If your code returns a 404 when *any* company has no data,
   *      let's test that scenario.
   */
  it('should return 404 when data is missing for one or more companies', async () => {
    // Suppose the first call returns data, but the second call returns null
    const mockDb = DbService.getDbServiceInstance();
    mockDb.data_for_nop
      .mockResolvedValueOnce([{ passage_date: '2023-01-01', passages: 50 }]) // AM => OK
      .mockResolvedValueOnce(null); // EG => No data found => triggers 404

    // This time, spawn might never be called for the second company because
    // the code will skip training if data_for_nop is null.
    // We just confirm we get a 404 in response.

    const response = await request(app).post('/api/training').send();
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('error', 'Data missing for one or more companies');
    // The `details` array in the JSON might show each missing company:
    expect(Array.isArray(response.body.details)).toBe(true);
    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ company: 'EG', error: 'No data found' })
      ])
    );
  });

  /**
   * 3) If the Python script exits with non-zero code => 500
   *    - Let's simulate the Python process returning an error.
   */
  it('should return 500 if the Python training script fails', async () => {
    // Return valid data for all companies so we get to the spawn call
    const mockDb = DbService.getDbServiceInstance();
    mockDb.data_for_nop.mockResolvedValue([{ passage_date: '2023-01-01', passages: 50 }]);

    // Simulate a Python process that exits with code 1 (error)
    spawn.mockImplementationOnce(() => {
      const mockProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, handler) => {
          if (event === 'close') {
            // Simulate exit code 1 (failed)
            handler(1);
          }
        }),
      };
      return mockProcess;
    });

    // We expect the training_controller to catch the error and potentially return 500
    const response = await request(app).post('/api/training').send();
    // Because your code has the success response commented out,
    // it might never actually send 500 either. 
    // Let's assume it does if there's an error:
    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty('error', 'Internal server error');
  });
});
