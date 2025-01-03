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


const BASE_URL = 'http://localhost:9115/'; // May need some changes

// Path to user storage and token file
const usersPath = path.resolve(__dirname, 'users.json');
const tokenPath = path.resolve(__dirname, 'token.json');

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

// Helper function to read users from users.json
const loadUsers = () => {
    if (!fs.existsSync(usersPath)) {
      console.error('Error: users.json not found. Please create it with a list of users.');
      process.exit(1);
    }
    const usersData = fs.readFileSync(usersPath, 'utf8');
    try {
      return JSON.parse(usersData);
    } catch (error) {
      console.error('Error parsing users.json:', error.message);
      process.exit(1);
    }
};

// Helper function to ensure the user has admin privileges
const ensureAdminRole = () => {
  const currentUser = getCurrentUser();
  if (currentUser.role !== 'admin') {
    throw new LogicalError('You do not have permission to execute this command. Admin privileges are required.');
  }
};

program
  .command('login')
  .description('Log in as a user')
  .requiredOption('--username <username>', 'Username')
  .requiredOption('--passw <password>', 'Password')
  .action(async (options) => {
    const { username, passw } = options;

    // Check if a user is already logged in
    if (fs.existsSync(tokenPath)) {
      const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
      console.error(`You are already logged in as '${tokenData.username}'. Please logout before logging in as a new user.`);
      process.exit(1);
    }

    // Simulate login logic (you can add your real API call here)
    const tokenData = { token: `${username}-token`, username, company: 'moreas', role: 'user' };

    fs.writeFileSync(tokenPath, JSON.stringify(tokenData, null, 2));
    console.log(`Logged in successfully as ${username}. Token saved.`);
  });

// Scope: logout
program
  .command('logout')
  .description('Log out the current user')
  .action(() => {
    if (fs.existsSync(tokenPath)) {
      fs.unlinkSync(tokenPath);
      console.log('Logged out successfully.');
    } else {
      console.log('No user is currently logged in.');
    }
  });

const getCurrentUser = () => {
    if (!fs.existsSync(tokenPath)) {
      console.error('Error: You must be logged in to perform this action.');
      process.exit(1);
    }
    const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    return tokenData;
  };

 // **Admin Command**
const adminCommand = program
.command('admin')
.description('Admin operations');

// **Admin Subcommand: usermod**
adminCommand
  .command('usermod')
  .description('Create or modify a user')
  .requiredOption('--username <username>', 'Username for the new user')
  .requiredOption('--passw <password>', 'Password for the new user')
  .action(async (options) => {
    ensureAdminRole(); // Ensure the user is an admin
    const currentUser = getCurrentUser();
    const headers = { Authorization: `Bearer ${currentUser.token}` };
    await callApi('/admin/usermod', 'POST', options, headers);
    console.log(`User ${options.username} created or updated successfully.`);
  });

// **Admin Subcommand: users**
adminCommand
  .command('users')
  .description('List all users')
  .action(async () => {
    ensureAdminRole(); // Ensure the user is an admin
    const currentUser = getCurrentUser();
    const headers = { Authorization: `Bearer ${currentUser.token}` };
    const result = await callApi('/admin/users', 'GET', null, headers);
    console.log('List of users:', result);
  });

// **Admin Subcommand: addpasses**
adminCommand
  .command('addpasses')
  .description('Add new passes from a CSV file')
  .requiredOption('--source <source>', 'Source CSV file for new passes')
  .action(async (options) => {
    ensureAdminRole(); // Ensure the user is an admin
    if (!fs.existsSync(options.source)) {
      throw new LogicalError(`File ${options.source} does not exist.`);
    }
    const currentUser = getCurrentUser();
    const headers = { Authorization: `Bearer ${currentUser.token}` };
    const csvData = fs.readFileSync(options.source, 'utf8');
    await callApi('/admin/addpasses', 'POST', { csv: csvData }, headers);
    console.log(`Passes from ${options.source} uploaded successfully.`);
  });

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

// Scope: tollstationpasses (restricted by company)
program
  .command('tollstationpasses')
  .description('Retrieve toll station passes')
  .requiredOption('--station <station>', 'Station ID')
  .requiredOption('--from <from>', 'Start date (YYYYMMDD)')
  .requiredOption('--to <to>', 'End date (YYYYMMDD)')
  .option('--format <format>', 'Response format (json/csv)', 'csv')
  .action(async (options) => {
    const { station, from, to, format } = options;
    const currentUser = getCurrentUser();

    if (currentUser.role !== 'admin' && currentUser.company !== station) {
      console.error(`Error: You can only access toll station data for your company: '${currentUser.company}'.`);
      process.exit(1);
    }

    const headers = { Authorization: `Bearer ${currentUser.token}` };
    const result = await callApi(`/tollStationPasses?station=${station}&from=${from}&to=${to}&format=${format}`, 'GET', null, headers);

    if (format === 'json') {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(result);
    }
  });

// Scope: passanalysis (restricted by company)
program
  .command('passanalysis')
  .description('Retrieve pass analysis data')
  .requiredOption('--stationop <stationop>', 'Station Operator')
  .requiredOption('--tagop <tagop>', 'Tag Operator')
  .requiredOption('--from <from>', 'Start date (YYYYMMDD)')
  .requiredOption('--to <to>', 'End date (YYYYMMDD)')
  .action(async (options) => {
    const { stationop, tagop, from, to } = options;
    const currentUser = getCurrentUser();

    if (currentUser.role !== 'admin' && currentUser.company !== stationop) {
      console.error(`Error: You can only access pass analysis data for your company: '${currentUser.company}'.`);
      process.exit(1);
    }

    const headers = { Authorization: `Bearer ${currentUser.token}` };
    const result = await callApi(`/passAnalysis?stationop=${stationop}&tagop=${tagop}&from=${from}&to=${to}`, 'GET', null, headers);
    console.log(result);
  });

// Scope: passescost (restricted by company)
program
  .command('passescost')
  .description('Retrieve pass cost data')
  .requiredOption('--stationop <stationop>', 'Station Operator')
  .requiredOption('--tagop <tagop>', 'Tag Operator')
  .requiredOption('--from <from>', 'Start date (YYYYMMDD)')
  .requiredOption('--to <to>', 'End date (YYYYMMDD)')
  .action(async (options) => {
    const { stationop, tagop, from, to } = options;
    const currentUser = getCurrentUser();

    if (currentUser.role !== 'admin' && currentUser.company !== stationop) {
      console.error(`Error: You can only access pass cost data for your company: '${currentUser.company}'.`);
      process.exit(1);
    }

    const headers = { Authorization: `Bearer ${currentUser.token}` };
    const result = await callApi(`/passesCost?stationop=${stationop}&tagop=${tagop}&from=${from}&to=${to}`, 'GET', null, headers);
    console.log(result);
  });

// Scope: chargesby (restricted by company)
program
  .command('chargesby')
  .description('Retrieve charges data by operator')
  .requiredOption('--opid <opid>', 'Operator ID')
  .requiredOption('--from <from>', 'Start date (YYYYMMDD)')
  .requiredOption('--to <to>', 'End date (YYYYMMDD)')
  .action(async (options) => {
    const { opid, from, to } = options;
    const currentUser = getCurrentUser();

    if (currentUser.role !== 'admin' && currentUser.company !== opid) {
      console.error(`Error: You can only access charge data for your company: '${currentUser.company}'.`);
      process.exit(1);
    }

    const headers = { Authorization: `Bearer ${currentUser.token}` };
    const result = await callApi(`/chargesBy?opid=${opid}&from=${from}&to=${to}`, 'GET', null, headers);
    console.log(result);
  });

program
  .command('whoami')
  .description('Show the current logged-in user')
  .action(() => {
    if (!fs.existsSync(tokenPath)) {
      console.error('Error: You are not logged in.');
      process.exit(1);
    }

    const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));

    // Determine what to show for admin and non-admin users
    const companyInfo = tokenData.role === 'admin' ? '' : `Company: ${tokenData.company ? tokenData.company : 'N/A'}\n`;

    console.log(`
      You are logged in as:
      ----------------------
      Username: ${tokenData.username}
      ${companyInfo}Role: ${tokenData.role ? tokenData.role : 'user'}
    `);
  });
// Parse arguments
program.parse(process.argv);
