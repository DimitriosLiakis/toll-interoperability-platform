const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.resolve(__dirname, 'test_passescost_multiple_users_random.log');

// Helper function to execute a CLI command and log the result
const runCommand = (command, description) => {
  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      const result = {
        description,
        command,
        output: stdout.trim(),
        error: stderr.trim(),
        success: !error,
      };

      // Log result
      const logEntry = `
Description: ${result.description}
Command: ${result.command}
Success: ${result.success}
Output: ${result.output || 'N/A'}
Error: ${result.error || 'N/A'}
---------------------------------
`;
      fs.appendFileSync(LOG_FILE, logEntry);
      resolve(result);
    });
  });
};

// Generate random parameters for testing
const generateRandomDate = () => {
  const year = Math.floor(Math.random() * 3) + 2023; // 2023, 2024, 2025
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  return `${year}${month}${day}`;
};

const generateRandomOperator = (valid = true) => {
  const validOperators = [
    'moreas',
    'egnatia_odos',
    'attiki_odos',
    'nea_odos',
    'olympia_odos',
  ];
  if (valid) {
    return validOperators[Math.floor(Math.random() * validOperators.length)];
  }
  return `invalid_op_${Math.floor(Math.random() * 1000)}`;
};

// Define all users
const users = [
  { username: 'moreas_user', password: 'password4', company: 'moreas' },
  { username: 'egnatia_user', password: 'password5', company: 'egnatia_odos' },
  { username: 'attiki_user', password: 'password6', company: 'attiki_odos' },
  { username: 'nea_user', password: 'password7', company: 'nea_odos' },
  { username: 'olympia_user', password: 'password8', company: 'olympia_odos' },
];

// Test scenarios for a single user
const testsForUser = async (user) => {
  console.log(`Starting tests for ${user.username}...`);

  // Login as current user
  await runCommand(
    `se2414 login --username ${user.username} --passw ${user.password}`,
    `Login as ${user.username}`
  );

  // Execute 30 random tests for the current user
  for (let i = 1; i <= 30; i++) {
    const randomStationOp = generateRandomOperator(true);
    const randomTagOp = generateRandomOperator(true);
    const randomDateFrom = generateRandomDate();
    const randomDateTo = generateRandomDate();

    // Test 1: Valid passescost command
    await runCommand(
      `se2414 passescost --stationop ${randomStationOp} --tagop ${randomTagOp} --from ${randomDateFrom} --to ${randomDateTo}`,
      `Test #${i} - Retrieve pass cost data for station '${randomStationOp}' and tag '${randomTagOp}' as ${user.username}`
    );

    // Test 2: Invalid station operator ID
    const invalidStationOp = generateRandomOperator(false);
    await runCommand(
      `se2414 passescost --stationop ${invalidStationOp} --tagop ${randomTagOp} --from ${randomDateFrom} --to ${randomDateTo}`,
      `Test #${i} - Retrieve pass cost data with invalid station operator '${invalidStationOp}' as ${user.username}`
    );

    // Test 3: Invalid tag operator ID
    const invalidTagOp = generateRandomOperator(false);
    await runCommand(
      `se2414 passescost --stationop ${randomStationOp} --tagop ${invalidTagOp} --from ${randomDateFrom} --to ${randomDateTo}`,
      `Test #${i} - Retrieve pass cost data with invalid tag operator '${invalidTagOp}' as ${user.username}`
    );

    // Test 4: Invalid date format
    await runCommand(
      `se2414 passescost --stationop ${randomStationOp} --tagop ${randomTagOp} --from invalid_date --to ${randomDateTo}`,
      `Test #${i} - Retrieve pass cost data with invalid start date as ${user.username}`
    );

    // Test 5: Access restricted for non-matching station operator
    const nonMatchingOp = generateRandomOperator(true);
    if (nonMatchingOp !== user.company) {
      await runCommand(
        `se2414 passescost --stationop ${nonMatchingOp} --tagop ${randomTagOp} --from ${randomDateFrom} --to ${randomDateTo}`,
        `Test #${i} - Attempt access for station operator '${nonMatchingOp}' as ${user.username}`
      );
    }
  }

  // Logout after tests
  await runCommand(
    `se2414 logout`,
    `Logout after tests for ${user.username}`
  );

  console.log(`Tests completed for ${user.username}.`);
};

// Main function to test all users
const tests = async () => {
  // Clear log file before running tests
  if (fs.existsSync(LOG_FILE)) fs.unlinkSync(LOG_FILE);

  console.log('Starting multiple tests for all users...');

  for (const user of users) {
    await testsForUser(user);
  }

  console.log('All tests completed. Check test_passescost_multiple_users_random.log for details.');
};

// Run tests
tests();
