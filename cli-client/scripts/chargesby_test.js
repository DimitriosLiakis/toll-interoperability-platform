const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.resolve(__dirname, 'test_chargesby_multiple.log');

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

// Test scenarios
const tests = async () => {
  // Clear log file before running tests
  if (fs.existsSync(LOG_FILE)) fs.unlinkSync(LOG_FILE);

  console.log('Starting multiple tests for "se2414 chargesby"...');

  // Test 1: Successful login as correct user
  await runCommand(
    `se2414 login --username moreas_user --passw password4`,
    'Login as moreas_user'
  );

  // Run multiple variations of the tests
  for (let i = 1; i <= 30; i++) {
    const randomOp = generateRandomOperator(true);
    const randomDateFrom = generateRandomDate();
    const randomDateTo = generateRandomDate();

    // Test 2: Valid chargesby command
    await runCommand(
      `se2414 chargesby --opid ${randomOp} --from ${randomDateFrom} --to ${randomDateTo}`,
      `Test #${i} - Retrieve charges data for valid operator '${randomOp}'`
    );

    // Test 3: Invalid operator ID
    const invalidOp = generateRandomOperator(false);
    await runCommand(
      `se2414 chargesby --opid ${invalidOp} --from ${randomDateFrom} --to ${randomDateTo}`,
      `Test #${i} - Retrieve charges data for invalid operator '${invalidOp}'`
    );

    // Test 4: Invalid date format
    await runCommand(
      `se2414 chargesby --opid ${randomOp} --from invalid_date --to ${randomDateTo}`,
      `Test #${i} - Retrieve charges data with invalid start date for operator '${randomOp}'`
    );

    // Test 5: Access restricted for non-matching user
    const nonMatchingOp = generateRandomOperator(true);
    if (nonMatchingOp !== 'moreas') {
      await runCommand(
        `se2414 chargesby --opid ${nonMatchingOp} --from ${randomDateFrom} --to ${randomDateTo}`,
        `Test #${i} - Attempt access for operator '${nonMatchingOp}' as moreas_user`
      );
    }
  }

  // Test 6: Logout after tests
  await runCommand(
    `se2414 logout`,
    'Logout after completing tests'
  );

  console.log('Tests completed. Check test_chargesby_multiple.log for details.');
};

// Run tests
tests();
