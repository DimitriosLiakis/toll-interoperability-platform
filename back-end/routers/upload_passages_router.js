const express = require('express');
const { uploadCsv } = require('../controllers/upload_passages_controller');
const router = express.Router();
/*
const csv = require('csv-parser');
const fs = require('fs');
const dbService = require('../dbService.js'); // Εισάγουμε υπηρεσίες για τη βάση δεδομένων
*/
// Route for uploading CSV files
router.use('/', uploadCsv);

module.exports = router; // Fix: Correct the export
/*
// Controller για την υποβολή αρχείων CSV
const uploadCSv = async (req, res) => {
    const filePath = req.file.path; // Παίρνουμε το μονοπάτι του ανεβασμένου αρχείου
    const results = []; // Αποθηκεύουμε τα δεδομένα του CSV
    fs.createReadStream(filePath) // Διαβάζουμε το αρχείο
        .pipe(csv())
        .on('data', (data) => results.push(data)) // Αποθηκεύουμε κάθε γραμμή
        .on('end', async () => {
            try {
                await dbService.insertPassages(results); // Ενημερώνουμε τη βάση δεδομένων
                res.status(200).json({ status: "OK" }); // Επιστρέφουμε επιτυχία
            } catch (error) {
                res.status(401).json({ status: "failed", info: error.message }); // Χειρισμός αποτυχίας
            }
        });
};
module.exports = { uploadCsv };*/