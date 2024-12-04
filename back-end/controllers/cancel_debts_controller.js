const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const DbService = require('../dbService.js'); // Database service
const util = require('util');

// Promisify the exec function for easier use with async/await
const execPromise = util.promisify(exec);

const cancel_debts = async (req, res) => {

    const scriptDir = path.join(__dirname, '../scripts');
    const script_name = 'cancelling_algo.py';
    const python_path = path.join(scriptDir, script_name);

    // Escape special characters in the path (optional, for safety)
    const python_escaped = python_path.replace(/(["\s'$`\\])/g, '\\$1');

    // Path to the debt figures directory
    const debtFiguresDir = path.join(__dirname, '../debt_figures');

    // Use the DbService to access the database
    const dbService = DbService.getDbServiceInstance();
    try {
        // Run the Python script
        console.log('Running Python script...');
        const { stdout, stderr } = await execPromise(
            `python3 "${python_escaped}" "${escapedFilePath}"`
        );

        console.log('Python script executed successfully.');

        // Get all .png files in the debt_figures directory
        const pngFiles = fs.readdirSync(debtFiguresDir).filter(file => file.endsWith('.png'));

        // Ensure that there are exactly 2 .png files
        if (pngFiles.length !== 2) {
            throw new Error('Expected 2 .png files in the debt_figures directory');
        }

        // Get the full paths for the .png files
        const filePaths = pngFiles.map(file => path.join(debtFiguresDir, file));

        // Respond with the success message and inserted records
        res.json({
            message: stdout.trim(),
            filePaths: filePaths, // Include the paths of the .png files
        });
    } catch (error) {
        // Handle errors in running the Python script or fetching records
        console.error('Error:', error.message || error.stderr || 'Unknown error.');
        res.status(500).json({ error: error.message || 'An unexpected error occurred.' });
    }
};

module.exports = { cancel_debts };
