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
        console.log(req.params);
        if (!tollOpID || !tagOpID || !date_from || !date_to) {
            return res.status(400).json({ error: 'Missing required parameters.'}); // 400 Bad Request
        }

        // Έλεγχος για λάθος μορφή ημερομηνίας
        if (!/^\d{8}$/.test(date_from) || !/^\d{8}$/.test(date_to)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYYMMDD.' }); // 400 Bad Request
        }
        const validPairs = ["AM", "EG", "GE", "KO", "MO", "NAO", "NO", "OO"];

        const isStationOpDifferent = validPairs.every(pair => !tollOpID.startsWith(pair));
        const isTagOpDifferent = validPairs.every(pair => !tagOpID.startsWith(pair));
        
        if (isStationOpDifferent || isTagOpDifferent) {
            return res.status(400).json({ error: 'Invalid OperatorID' });
        }
        

        // Διαμόρφωση των ημερομηνιών
        const formattedDateFrom = `${date_from.slice(0, 4)}-${date_from.slice(4, 6)}-${date_from.slice(6, 8)}`;
        const formattedDateTo = `${date_to.slice(0, 4)}-${date_to.slice(4, 6)}-${date_to.slice(6, 8)}`;

        const dbService = DbService.getDbServiceInstance();
        const { nPasses, passesCost } = await dbService.getPassesBetween2companies(tollOpID, tagOpID, formattedDateFrom, formattedDateTo);

        // Αν δεν υπάρχουν δεδομένα (nPasses == 0)
        if (nPasses === 0) {
            return res.status(204).send(); // 204 No Content
        }

        // Δημιουργία της απάντησης
        const response = {
            tollOpID,
            tagOpID,
            requestTimestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
            periodFrom: formattedDateFrom,
            periodTo: formattedDateTo,
            nPasses,
            passesCost: parseFloat(passesCost),
        };

        // Διαχείριση μορφής CSV
        if (format === 'csv') {
            try {
                // Μετατροπή της απάντησης σε CSV χρησιμοποιώντας json2csv
                const csvFields = Object.keys(response);
                const csv = json2csv(response, { fields: csvFields });

                // Ορισμός επικεφαλίδων για την απόκριση CSV
                res.header('Content-Type', 'text/csv');
                res.attachment('passes_cost.csv'); // Προτεινόμενο όνομα αρχείου
                return res.status(200).send(csv); // Επιστροφή του CSV
            } catch (csvError) {
                console.error('Error converting response to CSV:', csvError);
                return res.status(500).json({ error: 'Error generating CSV.' }); // 500 Internal Server Error
            }
        }

        // Επιστροφή JSON αν δεν ζητήθηκε CSV
        return res.status(200).json(response); // 200 OK (JSON)

    } catch (error) {
        console.error('Error fetching passes cost:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { passesCost_controller };
