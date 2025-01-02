const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const DbService = require('../dbService.js');
const util = require('util');

const get_figures = async (req, res) => {
    // Check for required query parameter (example: 'type')
    // const { type } = req.query;
    // if (!type) {
    //     return res.status(400).json({ error: 'Missing required query parameter: type' }); // 400 Bad Request
    // }

    const fig1Dir = path.join(__dirname, "../debt_figures");
    const figure1_name = 'initial_debts.png';
    const file_path = path.join(fig1Dir, figure1_name);

    const fig2Dir = path.join(__dirname, "../debt_figures");
    const figure2_name = 'final_debts.png';
    const file_path_2 = path.join(fig2Dir, figure2_name);

    const dbService = DbService.getDbServiceInstance();
    try {
        // Check if the files exist before trying to read them
        if (!fs.existsSync(file_path) || !fs.existsSync(file_path_2)) {
            // If either of the files is missing, return a 204 No Content response
            return res.status(204).send(); // No Content
        }

        const figure1Data = fs.readFileSync(file_path, { encoding: 'base64' });
        const figure2Data = fs.readFileSync(file_path_2, { encoding: 'base64' });

        res.status(200).json({
            message: "Figures of initial debts and debts after the optimization",
            figures: {
                figure1: `data:image/png;base64,${figure1Data}`,
                figure2: `data:image/png;base64,${figure2Data}`,
            },
        });
    } catch (error) {
        console.error('Error:', error.message || error.stderr || 'Unknown error.');
        res.status(500).json({
            error: error.message || 'An unexpected error occurred.',
        });
    }
};

module.exports = { get_figures };
