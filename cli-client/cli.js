#!/usr/bin/env node

const { Command } = require('commander');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const program = new Command();

program
  .name('se2414')
  .description('CLI for interacting with the REST API')
  .version('1.0.0');


const BASE_URL = 'http://localhost:9115/api/'; // May need some changes

// Helper function to call REST API
const callApi = async (endpoint, method = 'GET', data = null, headers = {}) => {
  try {
    const response = await axios({
      url: `${BASE_URL}${endpoint}`,
      method,
      data,
      headers,
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    process.exit(1);
  }
};

// Scope: healthcheck
program
  .command('healthcheck')
  .description('Check the health of the server')
  .action(async () => {
    const result = await callApi('/admin/healthcheck');
    console.log(result);
  });

// Scope: resetpasses
program
  .command('resetpasses')
  .description('Reset all passes data')
  .action(async () => {
    const result = await callApi('/admin/resetpasses', 'POST');
    console.log(result);
  });

// Scope: resetstations
program
  .command('resetstations')
  .description('Reset all stations data')
  .action(async () => {
    const result = await callApi('/admin/resetstations', 'POST');
    console.log(result);
  });

// Scope: login
program
  .command('login')
  .description('Log in as a user')
  .requiredOption('--username <username>', 'Username')
  .requiredOption('--passw <password>', 'Password')
  .action(async (options) => {
    const { username, passw } = options;
    const result = await callApi('/login', 'POST', { username, password: passw });
    console.log(result);

    // Save token to a local file for future requests
    const tokenPath = path.resolve(__dirname, 'token.json');
    fs.writeFileSync(tokenPath, JSON.stringify({ token: result.token }, null, 2));
    console.log('Logged in successfully. Token saved.');
  });

// Scope: logout
program
  .command('logout')
  .description('Log out the current user')
  .action(() => {
    const tokenPath = path.resolve(__dirname, 'token.json');
    if (fs.existsSync(tokenPath)) {
      fs.unlinkSync(tokenPath);
      console.log('Logged out successfully.');
    } else {
      console.log('No user is currently logged in.');
    }
  });

// Scope: tollstationpasses
program
  .command('tollstationpasses')
  .description('Retrieve toll station passes')
  .requiredOption('--station <station>', 'Station ID')
  .requiredOption('--from <from>', 'Start date (YYYYMMDD)')
  .requiredOption('--to <to>', 'End date (YYYYMMDD)')
  .option('--format <format>', 'Response format (json/csv)', 'csv')
  .action(async (options) => {
    const { station, from, to, format } = options;
    const tokenPath = path.resolve(__dirname, 'token.json');

    let headers = {};
    if (fs.existsSync(tokenPath)) {
      const { token } = JSON.parse(fs.readFileSync(tokenPath));
      headers.Authorization = `Bearer ${token}`;
    }

    const result = await callApi(
      `/tollStationPasses?station=${station}&from=${from}&to=${to}&format=${format}`,
      'GET',
      null,
      headers
    );

    if (format === 'json') {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(result); // Assume CSV string returned
    }
  });

// Additional scopes like passanalysis, passescost, chargesby, admin will follow a similar structure

// Parse arguments
program.parse(process.argv);
