const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const DbService = require('../dbService.js'); // Database service
const util = require('util');

// Promisify the exec function for easier use with async/await
const execPromise = util.promisify(exec);

const passing_toll = async (req, res) => {
    // Define the upload directory
    const uploadDir = path.join(__dirname, '../uploads');
    const filename = 'passages.csv';
    const csvFilePath = path.join(uploadDir, filename);

    const scriptDir = path.join(__dirname, '../scripts');
    const script_name = 'passage2mysql.py';
    const python_path = path.join(scriptDir, script_name);

    // Check if the file exists
    if (!fs.existsSync(csvFilePath)) {
        return res.status(400).json({ error: 'File not found in uploads directory.' });
    }

    // Escape special characters in the path (optional, for safety)
    const escapedFilePath = csvFilePath.replace(/(["\s'$`\\])/g, '\\$1');
    const python_escaped = python_path.replace(/(["\s'$`\\])/g, '\\$1');


    // Use the DbService to access the database
    const dbService = DbService.getDbServiceInstance();

    // Test the connection by calling a method that queries the database
    try {
        console.log('Testing database connection...');
        const lastPassageId = await dbService.getLastPassageId();
        console.log('Database connection test successful. Last passage ID:', lastPassageId);

        console.log("Let's get the p_id");
        const lastPId_before = lastPassageId; // Store the last passage ID before running the script

        // Run the Python script
        console.log('Running Python script...');
        const { stdout, stderr } = await execPromise(
            `python3 "${python_escaped}" "${escapedFilePath}"`
        );
        
        console.log('Python script executed successfully.');

        // Fetch the new records added since the last passage ID
        const newRecords = await dbService.getRecordsBetweenIds(lastPId_before);
        const lastPId_after = await dbService.getLastPassageId();

        // Respond with the success message and inserted records
        res.json({
            message: stdout.trim(),
            lastPId_before,
            lastPId_after,
            insertedRecords: newRecords,
        });
    } catch (error) {
        // Handle errors in running the Python script or fetching records
        console.error('Error:', error.message || error.stderr || 'Unknown error.');
        res.status(500).json({ error: error.message || 'An unexpected error occurred.' });
    }
};

module.exports = { passing_toll };
