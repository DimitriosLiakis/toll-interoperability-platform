const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const DbService = require('../dbService.js'); 
const util = require('util');

const get_figures = async (req, res) => {
    const figDir = path.join(__dirname, "../debt_figures");

    const figure1_name = 'initial_debts.png';
    const figure2_name = 'final_debts.png';
    const html1_name = 'initial_debts.html';
    const html2_name = 'final_debts.html';

    const file_paths = {
        figure1: path.join(figDir, figure1_name),
        figure2: path.join(figDir, figure2_name),
        html1: path.join(figDir, html1_name),
        html2: path.join(figDir, html2_name),
    };

    // Use the DbService to access the database
    const dbService = DbService.getDbServiceInstance();
    try {
        // Check if the files exist before trying to read them
        for (const filePath of Object.values(file_paths)) {
            if (!fs.existsSync(filePath)) {
                // If any of the files are missing, return a 204 No Content response
                return res.status(204).send(); // No Content
            }
        }

        // Read the files as base64 encoded strings for images and plain strings for HTML
        const figure1Data = fs.readFileSync(file_paths.figure1, { encoding: 'base64' });
        const figure2Data = fs.readFileSync(file_paths.figure2, { encoding: 'base64' });
        const html1Data = fs.readFileSync(file_paths.html1, { encoding: 'utf-8' });
        const html2Data = fs.readFileSync(file_paths.html2, { encoding: 'utf-8' });

        // Send a successful response with the figures and HTML files
        res.status(200).json({
            message: "Figures of initial debts and debts after the optimization",
            figures: {
                figure1: `data:image/png;base64,${figure1Data}`,
                figure2: `data:image/png;base64,${figure2Data}`,
            },
            html: {
                html1: html1Data,
                html2: html2Data,
            },
        });
    } catch (error) {
        // Handle errors that occur during file reading or any other unforeseen issue
        console.error('Error:', error.message || error.stderr || 'Unknown error.');
        res.status(500).json({
            error: error.message || 'An unexpected error occurred.',
        });
    }
};
module.exports = { get_figures };