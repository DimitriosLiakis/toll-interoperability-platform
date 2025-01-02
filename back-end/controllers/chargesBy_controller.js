const path = require('path');
const fs = require('fs');
const DbService = require('../dbService.js');
const util = require('util');
const json2csv = require('json2csv').parse;

const chargesBy_controller = async (req, res, next) => {
    try {
        const { tollOpID, date_from, date_to } = req.params;
        const format = req.query.format || 'json'; // Response format (JSON or CSV)

        if (!tollOpID || !date_from || !date_to) {
            return res.status(400).json({ error: 'Missing required parameters.' });
        }

        if (!/^\d{8}$/.test(date_from) || !/^\d{8}$/.test(date_to)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYYMMDD.' });
        }

        //YYYY-MM-DD
        const formattedDateFrom = `${date_from.slice(0, 4)}-${date_from.slice(4, 6)}-${date_from.slice(6, 8)}`;
        const formattedDateTo = `${date_to.slice(0, 4)}-${date_to.slice(4, 6)}-${date_to.slice(6, 8)}`;

        const dbService = DbService.getDbServiceInstance();

        const visitingOperators = ['AM', 'EG', 'GE', 'KO', 'MO', 'NAO', 'NO', 'OO'];

        let a=0;

        for (const visitingOpID of visitingOperators) {
            if (tollOpID==visitingOpID)
                a++;
        }

        if (a==0)
            return res.status(400).json({ error: 'Error in Operator selection' });

        
        
            if (!visitingOperators || visitingOperators.length === 0) {
            return res.status(400).json({ error: 'No visiting operators found for the given period.' });
        }

        const response = {
            tollOpID,
            requestTimestamp: new Date().toISOString(),
            periodFrom: formattedDateFrom,
            periodTo: formattedDateTo,
            vOpList: []
        };

        for (const visitingOpID of visitingOperators) {
            const debtDataRows = await dbService.getDebtBetween2companies(tollOpID, visitingOpID, formattedDateFrom, formattedDateTo);

            // Add each row to the vOpList
            debtDataRows.forEach(debtData => {
                response.vOpList.push({
                    visitingOpID,
                    nPasses: debtData.nPasses,
                    passesCost: debtData.passesCost
                });
            });
        }
        
            if (format === 'csv') {
                const csv = json2csv(response.vOpList);
                res.header('Content-Type', 'text/csv');
                res.attachment(`chargesBy_${tollOpID}_${date_from}_${date_to}.csv`);
                return res.send(csv);
            }

            return res.json(response);
        
    } catch (err) {
        console.error(err);
        next(err);
    }
};

module.exports = chargesBy_controller;
