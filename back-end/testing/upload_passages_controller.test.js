const request = require('supertest');
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();

// Mock the fs module to avoid actual file system interaction
jest.mock('fs');

// Import the routes and controller
const uploadRoutes = require('../routers/upload_passages_router');
app.post('/api/upload_passages', uploadRoutes);

// Test suite for the uploadCsv controller
describe('CSV File Upload Tests', () => {

  // Test for successful file upload
  it('should upload a CSV file and return success message', async () => {
    // Simulate a successful file upload
    const fileContent = 'header1,header2\nvalue1,value2\n';
    fs.writeFileSync = jest.fn(); // Mock fs.writeFileSync to prevent actual file writing

    const response = await request(app)
      .use('/api/upload_passages')
      .attach('file', Buffer.from(fileContent, 'utf8'), 'passages.csv') // Simulate uploading a CSV file
      .set('Accept', 'application/json')
      .query({ format: 'json' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('CSV file uploaded successfully!');
    expect(response.body.file.filename).toBe('passages.csv');
    expect(response.body.file.path).toBeDefined();
    expect(response.body.file.size).toBeGreaterThan(0);
  });

  // Test for invalid file type (non-CSV)
  it('should return 400 for invalid file type (not a CSV)', async () => {
    const response = await request(app)
      .post('/api/upload_passages')
      .attach('file', Buffer.from('Not a CSV file content'), 'not_a_csv.txt') // Simulate uploading a non-CSV file
      .set('Accept', 'application/json');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Only CSV files are allowed.');
  });

  // Test for no file uploaded
  it('should return 204 if no file is uploaded', async () => {
    const response = await request(app)
      .post('/api/upload_passages')
      .set('Accept', 'application/json');

    expect(response.status).toBe(204);
    expect(response.body.message).toBe('No file uploaded.');
  });

  // Test for file read error (simulate failure during file read)
  it('should return a 500 error if there is an issue reading the CSV file', async () => {
    const errorMessage = 'Error reading the file: File read error';
    fs.readFile = jest.fn().mockRejectedValue(new Error(errorMessage)); // Mock file read error

    const response = await request(app)
      .post('/api/upload_passages')
      .attach('file', Buffer.from('header1,header2\nvalue1,value2\n'), 'passages.csv')
      .set('Accept', 'application/json')
      .query({ format: 'csv' });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Error reading the file: File read error');
  });
});
