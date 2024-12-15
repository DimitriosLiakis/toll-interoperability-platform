const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const DbService = require('../dbService.js');
const util = require('util');
const json2csv = require('json2csv').parse;

// Controller για την επιστροφή διελεύσεων
const passesCost_controller = async (req, res, next) => {
    try {
        const { tollOpID, tagOpID, date_from, date_to } = req.params;
        const format = req.query.format || 'json'; 

        if (!tollOpID || !tagOpID || !date_from || !date_to) {
            return res.status(400).json({ error: 'Missing required parameters.' });
        }

        if (!/^\d{8}$/.test(date_from) || !/^\d{8}$/.test(date_to)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYYMMDD.' });
        }
        const formattedDateFrom = `${date_from.slice(0, 4)}-${date_from.slice(4, 6)}-${date_from.slice(6, 8)}`;
        const formattedDateTo = `${date_to.slice(0, 4)}-${date_to.slice(4, 6)}-${date_to.slice(6, 8)}`;

        const dbService = DbService.getDbServiceInstance();
        const { nPasses, passesCost } = await dbService.getPassesBetween2companies(tollOpID, tagOpID, formattedDateFrom, formattedDateTo);

        if (nPasses === 0) {
            return res.status(204).send(); // No content
        }

        // Build the response object
        const response = {
            tollOpID,
            tagOpID,
            requestTimestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
            periodFrom: formattedDateFrom,
            periodTo: formattedDateTo,
            nPasses,
            passesCost: parseFloat(passesCost),
        };

        // Handle CSV format
        if (format === 'csv') {
            // Convert response to CSV using json2csv
            const csvFields = Object.keys(response); 
            const csv = json2csv(response, { fields: csvFields });

            // Set response headers for CSV
            res.header('Content-Type', 'text/csv');
            res.attachment('passes_cost.csv'); // Suggest file name
            return res.send(csv); // Send the CSV response
        }

        // Default JSON response
        res.status(200).json(response);
    } catch (error) {
        // Handle errors
        console.error('Error fetching passes cost:', error);
        next(error); // Pass to error-handling middleware
    }
};

module.exports = { passesCost_controller };
