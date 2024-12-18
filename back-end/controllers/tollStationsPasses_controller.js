const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const DbService = require('../dbService.js'); // Database service
const util = require('util');
const json2csv = require('json2csv').parse; // Για μετατροπή σε CSV

// Controller για την επιστροφή διελεύσεων
const getTollStationPasses = async (req, res, next) => {
    try {
        const { tollStationID, date_from, date_to } = req.params;
        const format = req.query.format || 'json'; // Αν δεν υπάρχει παράμετρος format, χρησιμοποιούμε το json ως default

        // Έλεγχος αν λείπουν παράμετροι
        if (!tollStationID || !date_from || !date_to) {
            return res.status(204).send(); // Αν λείπει οποιαδήποτε παράμετρος, επιστρέφουμε 204 No Content
        }

        if (!/^\d{8}$/.test(date_from) || !/^\d{8}$/.test(date_to)) {
            return res.status(204).send(); // Αν το φορμάτ είναι λανθασμένο, επιστρέφουμε 204 No Content
        }

        const formattedDateFrom = `${date_from.slice(0, 4)}-${date_from.slice(4, 6)}-${date_from.slice(6, 8)}`;
        const formattedDateTo = `${date_to.slice(0, 4)}-${date_to.slice(4, 6)}-${date_to.slice(6, 8)}`;

        const dbService = DbService.getDbServiceInstance();
        const passes = await dbService.getRecordsBetweenDate(tollStationID, formattedDateFrom, formattedDateTo);

        // Αν δεν υπάρχουν δεδομένα για τον σταθμό ή την περίοδο
        if (passes.length === 0) {
            return res.status(204).send(); // Αν δεν υπάρχουν δεδομένα, επιστρέφουμε 204 No Content
        }

        let str1 = tollStationID;
        let result1 = str1.replace(/\d+/g, ''); // Εξαγωγή του ονόματος του χειριστή της σταθμού

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

        if (format === 'csv') {
            const csv = json2csv(response.passList); 
            res.header('Content-Type', 'text/csv'); // Ορισμός τύπου περιεχομένου
            res.attachment('toll_passes.csv'); // Προαιρετικά, προσδιορισμός του ονόματος του αρχείου
            return res.send(csv); // Επιστροφή του CSV
        }

        // Επιστροφή της απάντησης σε JSON (ή default μορφή)
        res.json(response);
    } catch (error) {
        // Διαχείριση σφαλμάτων στον server
        console.error('Error fetching toll station passes:', error);
        next(error); // Πάσα στο error handling middleware
    }
};

module.exports = { getTollStationPasses };
