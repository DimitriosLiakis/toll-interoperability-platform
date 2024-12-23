const { format } = require('date-fns');
const path = require('path');
const fs = require('fs');
const DbService = require('../dbService.js');
const json2csv = require('json2csv').parse;

const passAnalysis_controller = async (req, res, next) => {
    try {
        const { stationOpID, tollOpID, date_from, date_to } = req.params;
        const formatQuery = req.query.format || 'json';
        
        // Validate required parameters
        if (!stationOpID || !tollOpID || !date_from || !date_to) {
            return res.status(400).json({ error: 'Missing required parameters.' });
        }

        // Validate date format (YYYYMMDD)
        if (!/^\d{8}$/.test(date_from) || !/^\d{8}$/.test(date_to)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYYMMDD.' });
        }

        // Convert dates to YYYY-MM-DD
        const formattedDateFrom = `${date_from.slice(0, 4)}-${date_from.slice(4, 6)}-${date_from.slice(6, 8)}`;
        const formattedDateTo = `${date_to.slice(0, 4)}-${date_to.slice(4, 6)}-${date_to.slice(6, 8)}`;

        // Fetch data from the database
        const dbService = DbService.getDbServiceInstance();
        const passList = await dbService.getpassAnalysis(stationOpID, tollOpID, formattedDateFrom, formattedDateTo);

        // Format requestTimestamp using date-fns
        const formattedRequestTimestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');  // Format the current time

        // Construct response object
        const response = {
            stationOpID,
            tollOpID,
            requestTimestamp: formattedRequestTimestamp,  // formatted request timestamp
            periodFrom: formattedDateFrom,
            periodTo: formattedDateTo,
            nPasses: passList.length,
            passList: passList.map((pass, index) => ({
                passIndex: index + 1,
                passID: pass.passID,
                stationID: pass.stationID,
                timestamp: format(new Date(pass.timestamp), 'yyyy-MM-dd HH:mm:ss'),  // Format date
                tagID: pass.tagID,
                passCharge: parseFloat(pass.passCharge)
            }))
        };

        // Return response in requested format
        if (formatQuery === 'csv') {
            const csv = json2csv(response.passList, {
                fields: ['passIndex', 'passID', 'stationID', 'timestamp', 'tagID', 'passCharge']
            });
            res.header('Content-Type', 'text/csv');
            res.attachment(`pass_analysis_${stationOpID}_${tollOpID}_${date_from}_${date_to}.csv`);
            return res.send(csv);
        } else {
            return res.status(200).json(response);
        }
    } catch (error) {
        console.error('Error in passAnalysis_controller:', error.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

module.exports = passAnalysis_controller;
