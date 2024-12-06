const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const DbService = require('../dbService.js'); // Database service
const util = require('util');

// Promisify the exec function for easier use with async/await
const execPromise = util.promisify(exec);

const get_figures = async (req, res) => {

    const fig1Dir = path.join(__dirname, "../debt_figures");
    const figure1_name = 'initial_debts.png';
    const file_path = path.join(fig1Dir, figure1_name);


    const fig2Dir = path.join(__dirname, "../debt_figures");
    const figure2_name = 'final_debts.png';
    const file_path_2 = path.join(fig2Dir, figure2_name);

    // Use the DbService to access the database
    const dbService = DbService.getDbServiceInstance();
    try {

        const figure1Data = fs.readFileSync(file_path, { encoding: 'base64' });
        const figure2Data = fs.readFileSync(file_path_2, { encoding: 'base64' });

        res.json({
            message : "Figures of initial debts and debts after the optimization",
            figures : {
                figure1: `data:image/png;base64,${figure1Data}`,
                figure2: `data:image/png;base64,${figure2Data}`,
            },
        });
    } catch (error) {
        // Handle errors in running the Python script or fetching records
        console.error('Error:', error.message || error.stderr || 'Unknown error.');
        res.status(500).json({ error: error.message || 'An unexpected error occurred.' });
    }
};

module.exports = { get_figures };
