/**
 * @file cancel_debts_controller.test.js
 */

const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

// Import the controller
const { cancel_debts } = require('../controllers/cancel_debts_controller');

// Mock child_process and fs so we don't actually run Python or move files
jest.mock('child_process', () => ({
  exec: jest.fn()
}));

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  renameSync: jest.fn(),
}));

describe('PATCH /cancel_debts', () => {
  let app;

  beforeAll(() => {
    // Create a small express app that uses our router/controller
    app = express();

    // You can directly wire the controller to a route for testing:
    app.patch('/cancel_debts', cancel_debts);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 204 when Python script output is empty', async () => {
    // Mock the exec output to return an empty stdout
    exec.mockImplementation((cmd, callback) => {
      callback(null, { stdout: '' }); 
    });

    // Suppose `uploadDir` already exists
    fs.existsSync.mockReturnValue(true);

    const response = await request(app).patch('/cancel_debts');

    expect(response.status).toBe(204);
    expect(response.text).toBe(''); // No content
  });

  test('should return 200 (JSON) when Python script output contains file paths', async () => {
    // Mock the exec output to return multiple file paths
    exec.mockImplementation((cmd, callback) => {
      callback(null, {
        stdout: '/some/folder/file1.png\n/some/folder/file2.png'
      });
    });

    // Both upload directory and old files exist
    fs.existsSync.mockReturnValue(true);

    const response = await request(app).patch('/cancel_debts');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('files');
    // Example of checking the moved files
    expect(response.body.files).toHaveLength(2);
    expect(response.body.files[0]).toContain('file1.png');
    expect(response.body.files[1]).toContain('file2.png');
  });

  test('should return CSV (status 200) when Python script output contains file paths and `?format=csv` is requested', async () => {
    // Mock the exec output to return multiple file paths
    exec.mockImplementation((cmd, callback) => {
      callback(null, {
        stdout: '/some/folder/file1.png\n/some/folder/file2.png'
      });
    });

    // Both upload directory and old files exist
    fs.existsSync.mockReturnValue(true);

    const response = await request(app).patch('/cancel_debts?format=csv');

    expect(response.status).toBe(200);
    // The controller sets the response Content-Type to "text/csv"
    expect(response.headers['content-type']).toContain('text/csv');

    // Since we return CSV, the body should be a string with file info
    expect(response.text).toContain('File Name, File Path');
    expect(response.text).toContain('file1.png');
    expect(response.text).toContain('file2.png');
  });

  test('should return 500 if an error occurs in the Python script', async () => {
    // Mock the exec output to simulate an error
    exec.mockImplementation((cmd, callback) => {
      const error = new Error('Python script error');
      callback(error, null);
    });

    const response = await request(app).patch('/cancel_debts');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Python script error');
  });
});
