const path = require('path');
const fs = require('fs');
const DbService = require('../dbService.js');
const util = require('util');
const json2csv = require('json2csv').parse;

const chargesBy_controller = async (req, res, next) => {
    try {
        const { tollOpID, date_from, date_to } = req.params;
        const format = req.query.format || 'json'; // Response format (JSON or CSV)

        // Validate required parameters
        if (!tollOpID || !date_from || !date_to) {
            return res.status(400).json({ error: 'Missing required parameters.' });
        }

        // Validate date format
        if (!/^\d{8}$/.test(date_from) || !/^\d{8}$/.test(date_to)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYYMMDD.' });
        }

        // Format dates as YYYY-MM-DD
        const formattedDateFrom = `${date_from.slice(0, 4)}-${date_from.slice(4, 6)}-${date_from.slice(6, 8)}`;
        const formattedDateTo = `${date_to.slice(0, 4)}-${date_to.slice(4, 6)}-${date_to.slice(6, 8)}`;

        const dbService = DbService.getDbServiceInstance();

        const visitingOperators = ['AM', 'EG', 'GE', 'KO', 'MO', 'NAO', 'NO', 'OO'];

        // Validate operator
        if (!visitingOperators.includes(tollOpID)) {
            return res.status(400).json({ error: 'Error in Operator selection' });
        }

        const response = {
            tollOpID,
            requestTimestamp: new Date().toISOString(),
            periodFrom: formattedDateFrom,
            periodTo: formattedDateTo,
            vOpList: [],
        };

        // Fetch data for each visiting operator
        for (const visitingOpID of visitingOperators) {
            if (visitingOpID==tollOpID) continue;
            const debtDataRows = await dbService.getDebtBetween2companies(tollOpID, visitingOpID, formattedDateFrom, formattedDateTo);
            
            if (debtDataRows.length === 0 || visitingOpID==tollOpID) continue; // Skip if no data or the same company
            
            debtDataRows.forEach(debtData => {
                response.vOpList.push({
                    visitingOpID,
                    nPasses: debtData.nPasses,
                    passesCost: debtData.passesCost,
                });
            });
        }

        // Handle no data
        if (response.vOpList.length === 0) {
            return res.status(400).json({ error: 'No visiting operators found for the given period.' });
        }

        // Return CSV or JSON
        if (format === 'csv') {
            const csv = json2csv(response.vOpList);
            res.header('Content-Type', 'text/csv');
            res.attachment(`chargesBy_${tollOpID}_${date_from}_${date_to}.csv`);
            return res.send(csv);
        }

        return res.status(200).json(response);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = chargesBy_controller;
