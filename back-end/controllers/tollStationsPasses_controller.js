const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const DbService = require('../dbService.js'); // Database service
const util = require('util');

// Controller για την επιστροφή διελεύσεων
const getTollStationPasses = async (req, res, next) => {
    try {
        const { tollStationID, date_from, date_to } = req.params;

        if (!/^\d{8}$/.test(date_from) || !/^\d{8}$/.test(date_to)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYYMMDD.' });
        }

        // Μετατροπή ημερομηνιών σε μορφή "YYYY-MM-DD"
        const formattedDateFrom = `${date_from.slice(0, 4)}-${date_from.slice(4, 6)}-${date_from.slice(6, 8)}`;
        const formattedDateTo = `${date_to.slice(0, 4)}-${date_to.slice(4, 6)}-${date_to.slice(6, 8)}`;

        const dbService = DbService.getDbServiceInstance();

        const passes = await dbService.getRecordsBetweenDate(tollStationID, formattedDateFrom, formattedDateTo);
        let str1= tollStationID;
        let result1 = str1.replace(/\d+/g, '');
        const response = {
            stationID: tollStationID,
            stationOperator: result1,
            requestTimestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
            periodFrom: formattedDateFrom,
            periodTo: formattedDateTo,
            nPasses: passes.length,
            passList: passes.map((pass, index) => ({
                passIndex: index + 1,
                passID: pass.passage_id,
                timestamp: pass.timestamp,
                tagID: pass.tagRef,
                tagProvider: pass.tagHomeID,
                passType: pass.tollID === tollStationID ? 'home' : 'visitor',
                passCharge: parseFloat(pass.charge),
            })),
        };

        res.json(response);
    } catch (error) {
        next(error); // Πάσα στο error handling middleware
    }
};

module.exports = { getTollStationPasses };
