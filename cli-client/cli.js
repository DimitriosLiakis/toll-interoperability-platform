#!/usr/bin/env node

const { Command } = require('commander');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv').config();

const program = new Command();
let jwtToken = null; // Μεταβλητή μνήμης για το JWT token

program
  .name('se2414')
  .description('CLI for interacting with the REST API')
  .version('1.0.0');


const BASE_URL = 'http://localhost:9115/api/';
const TOKEN_FILE = path.join(__dirname, 'token.json');

// Αποθήκευση Token
function saveToken(token) {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify({ token }, null, 2));
}

// Φόρτωση Token
function loadToken() {
  if (fs.existsSync(TOKEN_FILE)) {
    const data = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
    return data.token;
  }
  return null;
}

// Διαγραφή Token
function deleteToken() {
  if (fs.existsSync(TOKEN_FILE)) {
    fs.unlinkSync(TOKEN_FILE);
  }
}

// Εντολή login
program
  .command('login')
  .description('Authenticate and obtain a JWT token')
  .requiredOption('--username <user_email>', 'Email for login') // Adjusted description
  .requiredOption('--passw <user_password>', 'Password for login') // Adjusted description
  .action(async (options) => {
    try {
      const response = await axios.post(`${BASE_URL}login`, {
        user_email: options.username, // Use user_email instead of username
        user_password: options.passw, // Use user_password instead of password
      });

      if (response.data && response.data.token) {
        jwtToken = response.data.token; // Store the token in memory
        console.log('Login successful! Token acquired.');
      } else {
        console.error('Login failed: No token returned from server.');
      }
    } catch (error) {
      if (error.response) {
        console.error(`Login failed: ${error.response.data.error || error.response.data.message}`);
      } else {
        console.error(`Login failed: ${error.message}`);
      }
    }
});

// Logout Command
program
  .command('logout')
  .description('Logout and remove the JWT token')
  .action(async () => {
    const jwtToken = loadToken();
    if (!jwtToken) {
      console.error('You must login first to perform this action.');
      process.exit(1);
    }

    try {
      const response = await axios.post(
        `${BASE_URL}logout`,
        {}, // Empty body
        {
          headers: { 'x-observatory-auth': jwtToken }, // Pass the token
        }
      );

      if (response.status === 200) {
        console.log('Logout successful!');
        deleteToken(); // Remove token from file
      } else {
        console.error('Logout failed with unexpected status:', response.status);
      }
    } catch (error) {
      if (error.response) {
        console.error('Logout failed:', error.response.data.error || error.response.data.message);
      } else {
        console.error('Logout failed:', error.message);
      }
    }
});

// Εντολή healthcheck
program
  .command('healthcheck')
  .description('Perform a healthcheck on the system')
  .action(async () => {
    if (!jwtToken) {
      console.error('You must login first to perform this action.');
      process.exit(1);
    }

    try {
      const response = await axios.get(`${BASE_URL}admin/healthcheck`, {
        headers: { 'x-observatory-auth': jwtToken }, 
      });

      if (response.status === 200) {
        console.log('Healthcheck successful!');
        console.log('Status:', response.data.status);
        console.log('Database Connection:', response.data.dbconnection);
        console.log('Number of Toll Stations:', response.data.n_stations);
        console.log('Number of Tags:', response.data.n_tags);
        console.log('Number of Passes:', response.data.n_passes);
      } else {
        console.error('Healthcheck failed with unexpected status:', response.status);
      }
    } catch (error) {
      if (error.response) {
        console.error('Healthcheck failed:', error.response.data.status || 'unknown error');
        console.error('Database Connection:', error.response.data.dbconnection || 'unknown');
      } else {
        console.error('Healthcheck failed:', error.message);
      }
    }
  });


// Εντολή resetpasses
program
  .command('resetpasses')
  .description('Reset all toll passes (admin only)')
  .action(async () => {
    if (!jwtToken) {
      console.error("You must login first to perform this action.");
      process.exit(1);
    }

    try {
      const response = await axios.post(
        `${process.env.API_URL || 'http://localhost:3000'}/admin/resetpasses`,
        {}, // Empty body
        {
          headers: {
            'x-observatory-auth': jwtToken,
          },
        }
      );
      console.log(response.data.message || "Passes reset successfully.");
    } catch (err) {
      if (err.response) {
        console.error(`Error: ${err.response.data.error}`);
      } else {
        console.error(`Error: ${err.message}`);
      }
      process.exit(1);
    }
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

// Scope: resetstations
program
  .command('resetstations')
  .description('Reset all stations data')
  .action(async () => {
    const result = await callApi('/admin/resetstations', 'POST');
    console.log(result);
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
