#!/usr/bin/env node
const { Command } = require('commander');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv').config();
const bcrypt = require('bcryptjs');

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

function mapRoleToOperator(role) {
    switch (role) {
      case 'aegeanmotorway': 
        return 'AM';
      case 'egnatia': 
        return 'EG';
      case 'gefyra': 
        return 'GE';
      case 'kentrikiodos': 
        return 'KO';
      case 'moreas': 
        return 'MO';
      case 'naodos': 
        return 'NAO';
      case 'neaodos': 
        return 'NO';
      case 'olympiaodos': 
        return 'OO';
      // Optionally handle 'admin' or unknown roles:
      case 'admin':
        return 'admin';
      default:
        return null; // or throw an error
    }
}

// Εντολή login
// Login Command
program
  .command('login')
  .description('Authenticate and obtain a JWT token')
  .requiredOption('--username <user_email>', 'Email for login') // Expecting email
  .requiredOption('--passw <user_password>', 'Password for login') // Expecting password
  .action(async (options) => {
    try {
      const response = await axios.post(`${BASE_URL}login`, {
        user_email: options.username, // Match backend expected field
        user_password: options.passw, // Match backend expected field
      });

      if (response.data && response.data.token) {
        jwtToken = response.data.token; // Store token in memory
        saveToken(jwtToken); // Save token to file for persistence
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
  .description('Perform a healthcheck on the system (Admin Only)')
  .action(async () => {
    const jwtToken = loadToken(); // Load token from file

    if (!jwtToken) {
      console.error('You must log in first to perform this action.');
      process.exit(1);
    }

    try {
      // Verify user role before making the request
      const userResponse = await axios.get(`${BASE_URL}whoami`, {
        headers: { 'x-observatory-auth': jwtToken },
      });

      if (userResponse.data.user_role !== 'admin') {
        console.error('Access Denied: Only admin users can perform this action.');
        process.exit(1);
      }

      // Perform the healthcheck request
      const response = await axios.get(`${BASE_URL}admin/healthcheck`, {
        headers: { 'x-observatory-auth': jwtToken },
      });

      if (response.status === 200 && response.data.status === "OK") {
        console.log('Healthcheck successful');
        console.log('----------------------------');
        console.log(`Status: ${response.data.status}`);
        console.log(`Database Connection: ${response.data.dbconnection}`);
        console.log(`Number of Toll Stations: ${response.data.n_stations}`);
        console.log(`Number of Tags: ${response.data.n_tags}`);
        console.log(`Number of Passes: ${response.data.n_passes}`);
        console.log('----------------------------');
      } else {
        console.error('Healthcheck failed:');
        console.log('----------------------------');
        console.log(`Status: ${response.data.status}`);
        console.log(`Database Connection: ${response.data.dbconnection}`);
        console.log('----------------------------');
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          console.error('Unauthorized: Invalid or expired token. Please log in again.');
          deleteToken(); // Remove invalid token
        } else if (error.response.status === 403) {
          console.error('Access Denied: You do not have permission to perform this action.');
        } else {
          console.error('Healthcheck request failed:', error.response.data.error || 'Unknown error');
        }
      } else {
        console.error('Healthcheck request failed:', error.message);
      }
    }
  });

program
  .command('resetpasses')
  .description('Reset all toll passes (Admin Only)')
  .action(async () => {
    const jwtToken = loadToken();
    if (!jwtToken) {
      console.error("You must log in first to perform this action.");
      process.exit(1);
    }

    try {
      // 1️⃣ Verify user role is admin
      const userResponse = await axios.get(`${BASE_URL}whoami`, {
        headers: { 'x-observatory-auth': jwtToken },
      });
      if (userResponse.data.user_role !== 'admin') {
        console.error("Access Denied: Only admin users can perform this action.");
        process.exit(1);
      }

      // 2️⃣ Call the resetpasses endpoint
      const response = await axios.post(`${BASE_URL}admin/resetpasses`, {}, {
        headers: { 'x-observatory-auth': jwtToken },
      });

      // 3️⃣ Check response
      if (response.status === 200 && response.data.status === "OK") {
        console.log("Passes reset successfully.");
        console.log("Admin account set to admin/freepasses4all");
      } else {
        console.error(`Failed to reset passes: ${response.data.info || 'Unknown error'}`);
      }
    } catch (error) {
      if (error.response) {
        console.error(`Error: ${error.response.data.error || error.response.data.info || 'Unknown error'}`);
      } else {
        console.error(`Error: ${error.message}`);
      }
      process.exit(1);
    }
});
  
 // **Admin Command**
 program
 .command('admin')
 .description('Admin operations via flags')
 .option('--users', 'List all users')
 .option('--usermod', 'Create or modify a user')
 .option('--userdelete', 'Delete a user by username')
 .option('--username <username>', 'Username (email)')
 .option('--passw <password>', 'Password for usermod')
 .option('--addpasses', 'Add new passes from a CSV file')
 .option('--source <source>', 'Source CSV file for new passes')
 .option('--setrole', 'Set a specific role for a user (Admin Only)')
 .option('--role <role>', 'Role to set (e.g. aegeanmotorway, egnatia, admin, etc.)')
 .action(async (options) => {
   // 1️⃣ Check if user is logged in
   const jwtToken = loadToken(); 
   if (!jwtToken) {
     console.error('You must log in first to perform this action.');
     process.exit(1);
   }

   // 2️⃣ Verify user is admin
   try {
     const userResponse = await axios.get(`${BASE_URL}whoami`, {
       headers: { 'x-observatory-auth': jwtToken },
     });
     if (userResponse.data.user_role !== 'admin') {
       console.error('Access Denied: Only admin users can perform this action.');
       process.exit(1);
     }
   } catch (err) {
     console.error('Error verifying admin role:', err.response?.data?.error || err.message);
     process.exit(1);
   }

   // 3️⃣ Decide which admin operation to run based on flags
   try {
     // --users
     if (options.users) {
       await listAllUsers(jwtToken);
     }
     // --usermod
     else if (options.usermod) {
       if (!options.username || !options.passw) {
         console.error('Must provide --username and --passw for usermod.');
         process.exit(1);
       }
       await userMod(jwtToken, options.username, options.passw);
     }
     // --userdelete
     else if (options.userdelete) {
       if (!options.username) {
         console.error('Must provide --username for userdelete.');
         process.exit(1);
       }
       await userDelete(jwtToken, options.username);
     }
     else if (options.addpasses) {
        if (!options.source) {
          console.error('Must provide --source <filename.csv> for addpasses.');
          process.exit(1);
        }
        await addPasses(jwtToken, options.source);

     } else if (options.setrole) {
        if (!options.username || !options.role) {
          console.error('Must provide --username and --role for setrole.');
          process.exit(1);
        }
        await setUserRole(jwtToken, options.username, options.role);
        }
        // If no flag was passed
     else {
       console.log(`
Usage:
 se2414 admin --users
 se2414 admin --usermod --username <email> --passw <password>
 se2414 admin --userdelete --username <email>
 se2414 admin --addpasses --source <filename.csv>
 se2414 admin --setrole --username <email> --role <user_role>
       `);
     }
   } catch (error) {
     console.error('Error in admin command:', error.response?.data?.error || error.message);
   }
 });

// Scope: resetstations
program
  .command('resetstations')
  .description('Reset all stations data (Admin Only)')
  .action(async () => {
    // 1. Ensure token is loaded
    const jwtToken = loadToken();
    if (!jwtToken) {
      console.error('You must log in first to perform this action.');
      process.exit(1);
    }

    // 2. Verify user is admin
    try {
      const userResponse = await axios.get(`${BASE_URL}whoami`, {
        headers: { 'x-observatory-auth': jwtToken },
      });
      if (userResponse.data.user_role !== 'admin') {
        console.error('Access Denied: Only admin users can perform this action.');
        process.exit(1);
      }
    } catch (err) {
      console.error('Error verifying admin role:', err.response?.data?.error || err.message);
      process.exit(1);
    }

    // 3. Perform the reset
    try {
      const response = await axios.post(`${BASE_URL}admin/resetstations`, {}, {
        headers: { 'x-observatory-auth': jwtToken },
      });

      if (response.status === 200 && response.data?.status === 'OK') {
        console.log('Stations reset successfully.');
      } else {
        console.error('Failed to reset stations:', response.data?.info || 'Unknown error');
      }
    } catch (error) {
      console.error('Error resetting stations:', error.response?.data?.info || error.message);
    }
});

program
  .command('passanalysis')
  .description('Retrieve pass analysis data (with role check)')
  .requiredOption('--stationop <stationOpID>', 'Station Operator code (e.g. AM, EG, NAO, etc.)')
  .requiredOption('--tagop <tagOpID>', 'Tag Operator code (e.g. AM, EG, NAO, etc.)')
  .requiredOption('--from <dateFrom>', 'Start date (YYYYMMDD)')
  .requiredOption('--to <dateTo>', 'End date (YYYYMMDD)')
  .option('--format <format>', 'Output format: json or csv', 'json')
  .action(async (options) => {
    //Load token
    const jwtToken = loadToken();
    if (!jwtToken) {
      console.error('You must log in first to perform this action.');
      process.exit(1);
    }

    try {
      //Fetch user role via /whoami
      const whoamiResponse = await axios.get(`${BASE_URL}whoami`, {
        headers: { 'x-observatory-auth': jwtToken },
      });
      const userRole = whoamiResponse.data.user_role; // e.g. "aegeanmotorway" or "admin"
      const mappedOp = mapRoleToOperator(userRole);   // e.g. "AM" or "admin"

      //If not admin, ensure stationOpID matches user’s operator
      if (mappedOp !== 'admin' && mappedOp !== options.stationop) {
        console.error(
          `Access Denied: Your operator code is "${mappedOp}", but requested stationop is "${options.stationop}".`
        );
        process.exit(1);
      }

      //Construct the path-based URL
      // e.g. GET /passAnalysis/:stationOpID/:tagOpID/:date_from/:date_to?format=csv|json
      const finalUrl = `${BASE_URL}passAnalysis/${options.stationop}/${options.tagop}/${options.from}/${options.to}?format=${options.format}`;

      //Decide if CSV or JSON
      const responseType = options.format === 'csv' ? 'text' : 'json';

      //Make the request
      const response = await axios.get(finalUrl, {
        headers: { 'x-observatory-auth': jwtToken },
        responseType,
      });

      //Handle the response
      if (response.status === 204) {
        console.log('No passes found for this period.');
      } else if (response.status === 200) {
        if (options.format === 'csv') {
          // CSV => print raw text
          console.log(response.data);
        } else {
          // JSON => pretty-print
          console.log(JSON.stringify(response.data, null, 2));
        }
      } else {
        console.error(`passanalysis failed with unexpected status: ${response.status}`);
      }
    } catch (error) {
      if (error.response) {
        console.error(
          'passanalysis failed:',
          error.response.data.error || error.response.data.info || error.message
        );
      } else {
        console.error('passanalysis failed:', error.message);
      }
      process.exit(1);
    }
});

program
  .command('tollstationpasses')
  .description('Retrieve passes from a specific toll station (with role check)')
  .requiredOption('--station <stationID>', 'Toll Station ID (e.g. AM03, EG09, etc.)')
  .requiredOption('--from <dateFrom>', 'Start date in YYYYMMDD format')
  .requiredOption('--to <dateTo>', 'End date in YYYYMMDD format')
  .option('--format <format>', 'Output format: json or csv (default: json)', 'json')
  .action(async (options) => {
    //Load JWT token
    const jwtToken = loadToken();
    if (!jwtToken) {
      console.error('You must log in first to perform this action.');
      process.exit(1);
    }

    try {
      //Check user role via /whoami
      const whoamiResponse = await axios.get(`${BASE_URL}whoami`, {
        headers: { 'x-observatory-auth': jwtToken },
      });

      const userRole = whoamiResponse.data.user_role; // e.g. "aegeanmotorway"
      const userOp = mapRoleToOperator(userRole);     // e.g. "AM" or "admin"
      // If userOp is null, handle error, or let them pass if you want

      //If not admin, ensure station ID matches operator code
      if (userOp !== 'admin') {
        // The station must start with the operator code, e.g. "AM03" starts with "AM"
        if (!options.station.startsWith(userOp)) {
          console.error(
            `Access Denied: Station "${options.station}" does not belong to your operator "${userOp}".`
          );
          process.exit(1);
        }
      }

      //Construct the path-based URL
      // e.g. GET /tollstationpasses/:tollStationID/:date_from/:date_to?format=csv
      const finalUrl = `${BASE_URL}tollstationpasses/${options.station}/${options.from}/${options.to}?format=${options.format}`;

      //Decide if CSV or JSON
      const responseType = (options.format === 'csv') ? 'text' : 'json';

      //Make the request
      const response = await axios.get(finalUrl, {
        headers: { 'x-observatory-auth': jwtToken },
        responseType,
      });

      //Handle response
      if (response.status === 204) {
        console.log('No passes found for this period/station.');
      } else if (response.status === 200) {
        if (options.format === 'csv') {
          // Print raw CSV
          console.log(response.data);
        } else {
          // Pretty-print JSON
          console.log(JSON.stringify(response.data, null, 2));
        }
      } else {
        console.error(`Request failed with unexpected status: ${response.status}`);
      }
    } catch (error) {
      if (error.response) {
        console.error(
          'Error fetching toll station passes:',
          error.response.data.error || error.response.data.info || error.message
        );
      } else {
        console.error('Error fetching toll station passes:', error.message);
      }
      process.exit(1);
    }
});


program
  .command('passescost')
  .description('Retrieve pass cost data (restricted by operator code)')
  .requiredOption('--stationop <op1>', 'Station Operator (e.g., AM, EG, NAO, etc.)')
  .requiredOption('--tagop <op2>', 'Tag Operator (e.g., AM, EG, NAO, etc.)')
  .requiredOption('--from <from>', 'Start date in YYYYMMDD format')
  .requiredOption('--to <to>', 'End date in YYYYMMDD format')
  .option('--format <format>', 'Output format: json or csv (default: json)', 'json')
  .action(async (options) => {
    const jwtToken = loadToken();
    if (!jwtToken) {
      console.error('You must log in first to perform this action.');
      process.exit(1);
    }

    try {
      //Fetch user’s role via /whoami
      const whoamiResponse = await axios.get(`${BASE_URL}whoami`, {
        headers: { 'x-observatory-auth': jwtToken },
      });
      const userRole = whoamiResponse.data.user_role; // e.g. "aegeanmotorway" or "admin"
      const mappedOp = mapRoleToOperator(userRole);   // e.g. "AM" or "admin"

      //If not admin, verify that the user’s operator matches --stationop
      if (mappedOp !== 'admin' && mappedOp !== options.stationop) {
        console.error(
          `Access Denied: Your operator code is "${mappedOp}", but requested stationop is "${options.stationop}".`
        );
        process.exit(1);
      }

      //Construct the path-based URL
      // GET /passesCost/:tollOpID/:tagOpID/:date_from/:date_to?format=csv|json
      const finalUrl = `${BASE_URL}passesCost/${options.stationop}/${options.tagop}/${options.from}/${options.to}?format=${options.format}`;

      //If CSV, set responseType to 'text'
      const responseType = options.format === 'csv' ? 'text' : 'json';

      //Make the request
      const response = await axios.get(finalUrl, {
        headers: { 'x-observatory-auth': jwtToken },
        responseType,
      });

      //Handle response
      if (response.status === 204) {
        console.log('No passes found for this period/operator combination.');
      } else if (response.status === 200) {
        // CSV or JSON printing
        if (options.format === 'csv') {
          console.log(response.data);
        } else {
          console.log(JSON.stringify(response.data, null, 2));
        }
      } else {
        console.error(`passescost failed with unexpected status: ${response.status}`);
      }
    } catch (error) {
      if (error.response) {
        console.error(
          'passescost failed:',
          error.response.data.error || error.response.data.info || error.message
        );
      } else {
        console.error('passescost failed:', error.message);
      }
      process.exit(1);
    }
});

program
  .command('chargesby')
  .description('Retrieve charges data by operator (with role check)')
  .requiredOption('--opid <opid>', 'Operator ID (e.g. AM, EG, NAO, etc.)')
  .requiredOption('--from <dateFrom>', 'Start date in YYYYMMDD format')
  .requiredOption('--to <dateTo>', 'End date in YYYYMMDD format')
  .option('--format <format>', 'Output format: json or csv (default: json)', 'json')
  .action(async (options) => {
    // 1️⃣ Load JWT token
    const jwtToken = loadToken();
    if (!jwtToken) {
      console.error('You must log in first to perform this action.');
      process.exit(1);
    }

    try {
      //Check the user’s role
      const whoamiResponse = await axios.get(`${BASE_URL}whoami`, {
        headers: { 'x-observatory-auth': jwtToken },
      });
      const userRole = whoamiResponse.data.user_role; // e.g. "aegeanmotorway" or "admin"
      const mappedOp = mapRoleToOperator(userRole);   // e.g. "AM", or "admin"

      //If not admin, enforce that user’s operator code == `opid`
      if (mappedOp !== 'admin' && mappedOp !== options.opid) {
        console.error(
          `Access Denied: Your operator code is "${mappedOp}", but requested operator is "${options.opid}".`
        );
        process.exit(1);
      }

      //Construct the path-based URL
      // e.g. GET /chargesBy/:opid/:date_from/:date_to?format=csv|json
      const finalUrl = `${BASE_URL}chargesBy/${options.opid}/${options.from}/${options.to}?format=${options.format}`;

      //If CSV, set `responseType` to 'text'; otherwise 'json'
      const responseType = options.format === 'csv' ? 'text' : 'json';

      //Make the GET request
      const response = await axios.get(finalUrl, {
        headers: { 'x-observatory-auth': jwtToken },
        responseType,
      });

      //Handle the response
      if (response.status === 204) {
        console.log('No charges found for this operator/period.');
      } else if (response.status === 200) {
        if (options.format === 'csv') {
          // CSV => print raw text
          console.log(response.data);
        } else {
          // JSON => pretty-print
          console.log(JSON.stringify(response.data, null, 2));
        }
      } else {
        console.error(`chargesby failed with unexpected status: ${response.status}`);
      }
    } catch (error) {
      if (error.response) {
        console.error(
          'chargesby failed:',
          error.response.data.error || error.response.data.info || error.message
        );
      } else {
        console.error('chargesby failed:', error.message);
      }
      process.exit(1);
    }
});

// Whoami Command
program
  .command('whoami')
  .description('Show the currently logged-in user')
  .action(async () => {
    const jwtToken = loadToken(); // Load stored JWT token

    if (!jwtToken) {
      console.error('Error: You are not logged in.');
      process.exit(1);
    }

    try {
      const response = await axios.get(`${BASE_URL}whoami`, {
        headers: { 'x-observatory-auth': jwtToken }, // Send token
      });

      if (response.status === 200 && response.data) {
        console.log(`
        You are logged in as:
        ----------------------
        Username: ${response.data.user_email}
        Role: ${response.data.user_role}
        `);
      } else {
        console.error('Error: Unexpected response from server.');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error('Session expired or invalid token. Please log in again.');
        deleteToken(); // Remove expired token
      } else {
        console.error('Error retrieving user info:', error.message);
      }
    }
});

// Parse arguments
program.parse(process.argv);

async function listAllUsers(jwtToken) {
    const response = await axios.get(`${BASE_URL}admin/users`, {
      headers: { 'x-observatory-auth': jwtToken },
    });
    if (response.status === 200 && Array.isArray(response.data.users)) {
      console.log('List of Registered Users:');
      console.log('----------------------------------');
      response.data.users.forEach((user, index) => {
        console.log(`User ${index + 1}:`);
        console.log(`Email: ${user.user_email}`);
        console.log(`Role: ${user.user_role}`);
        console.log('----------------------------------');
      });
      console.log(`Total Users: ${response.data.users.length}`);
    } else {
      console.error('Failed to fetch user list.');
    }
}
  
async function userMod(jwtToken, username, password) {
    // Send plain text password. The server will hash it.
    const response = await axios.post(`${BASE_URL}admin/usermod`, {
      user_email: username,
      user_password: password,
    }, {
      headers: { 'x-observatory-auth': jwtToken },
    });
  
    if (response.status === 200 || response.status === 201) {
      console.log(`User ${username} created or updated successfully.`);
    } else {
      console.error(`Failed to create/update user: ${response.data.error}`);
    }
}
  
async function userDelete(jwtToken, username) {
    const response = await axios.delete(`${BASE_URL}admin/userdelete/${username}`, {
      headers: { 'x-observatory-auth': jwtToken },
    });
    if (response.status === 200) {
      console.log(`User "${username}" deleted successfully.`);
    } else {
      console.error(`Failed to delete user: ${response.data.error}`);
    }
}

const FormData = require('form-data'); // Ensure you have form-data installed

async function addPasses(jwtToken, csvPath) {
  // 1️⃣ Check that the file exists locally
  if (!fs.existsSync(csvPath)) {
    console.error(`File not found: ${csvPath}`);
    process.exit(1);
  }

  try {
    // 2️⃣ Create a FormData instance & append the CSV file under form field "file"
    const formData = new FormData();
    formData.append('file', fs.createReadStream(csvPath), path.basename(csvPath));

    // 3️⃣ POST to /admin/addpasses with multipart headers
    const response = await axios.post(
      `${BASE_URL}admin/addpasses`,
      formData,
      {
        headers: {
          'x-observatory-auth': jwtToken,
          ...formData.getHeaders(), // Required for multipart
        },
      }
    );

    // 4️⃣ Check response
    if (response.status === 200 && response.data.status === 'OK') {
      console.log(`Passes from "${csvPath}" uploaded successfully.`);
    } else {
      console.error(`Failed to add passes: ${response.data.info || 'Unknown error'}`);
    }
  } catch (error) {
    // 5️⃣ Error handling
    if (error.response) {
      console.error(`Error uploading passes: ${error.response.data.info || error.response.data.error || 'Unknown error'}`);
    } else {
      console.error(`Error uploading passes: ${error.message}`);
    }
  }
}



async function setUserRole(jwtToken, username, role) {
    try {
      const response = await axios.post(
        `${BASE_URL}admin/setrole`,
        { user_email: username, user_role: role },
        { headers: { 'x-observatory-auth': jwtToken } }
      );
  
      if (response.status === 200 && response.data.message) {
        console.log(`${response.data.message}`);
      } else {
        console.error(`Failed to set role: ${response.data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error setting user role:', error.response?.data?.error || error.message);
    }
}