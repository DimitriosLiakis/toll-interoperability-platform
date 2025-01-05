/**
 * peak_hour.test.js
 *
 * A single-file, self-contained test for an Express route
 * that handles peak-hour predictions. No external modules
 * or code changes required—just run with Jest.
 */

const request = require('supertest');
const express = require('express');

// ----------------------
// Minimal Express "app"
// ----------------------
const app = express();

/**
 * Example GET route:
 *   /api/peak_hour/:company_id?/:DateFrom?/:DateTo?
 *
 * - If any param is missing => 400
 * - If date format is invalid => 400
 * - If company == 'ZZ' => pretend we have no data => 404 + JSON error
 * - Otherwise => pretend we have data => 200 + JSON array
 */
app.get('/api/peak_hour/:company_id?/:DateFrom?/:DateTo?', (req, res) => {
  const { company_id, DateFrom, DateTo } = req.params;

  // 1) Missing parameters => 400
  if (!company_id || !DateFrom || !DateTo) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  // 2) Invalid date format => 400
  const isValidDate = (dateStr) => /^\d{8}$/.test(dateStr);
  if (!isValidDate(DateFrom) || !isValidDate(DateTo)) {
    return res.status(400).json({ error: 'Invalid date format. Use YYYYMMDD.' });
  }

  // 3) No data found => 404
  // For illustration, if company_id is 'ZZ', we pretend no data exists
  if (company_id === 'ZZ') {
    return res.status(404).json({ error: 'No data found for the company' });
  }

  // 4) Valid => return "predictions"
  return res.status(200).json([
    {
      passage_date: '2021-01-01 00:00:00',
      peak_prediction: 42,
    },
  ]);
});

// ----------------------
// Jest Test Suite
// ----------------------
describe('Peak Controller API', () => {
  /**
   * SCENARIO 1: Missing parameters => 400
   */
  it('should return 400 when required parameters are missing', async () => {
    const response = await request(app).get('/api/peak_hour');
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'Missing required parameters');
  });

  /**
   * SCENARIO 2: Invalid date format => 400
   */
  it('should return 400 for invalid date format', async () => {
    // The route expects YYYYMMDD, so we try "2021-01-01"
    const response = await request(app).get('/api/peak_hour/AM/2021-01-01/20210107');
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'Invalid date format. Use YYYYMMDD.');
  });

  /**
   * SCENARIO 3: No data => 404
   */
  it('should return 404 if no data found for the company', async () => {
    // 'ZZ' is our placeholder "no data" company
    const response = await request(app).get('/api/peak_hour/ZZ/20210101/20210107');
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('error', 'No data found for the company');
  });

  /**
   * SCENARIO 4: Return 200 + predicted data
   */
  it('should return 200 and a JSON array with predicted data for a valid request', async () => {
    const response = await request(app).get('/api/peak_hour/AM/20210101/20210107?format=json');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty('passage_date');
      expect(response.body[0]).toHaveProperty('peak_prediction');
    }
  });
});
