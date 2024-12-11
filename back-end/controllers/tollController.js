// back-end/controllers/tollController.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const tolls = [];

// Parse the CSV file
const parseCSV = () => {
    fs.createReadStream(path.join(__dirname, '../uploads/tolls.csv'))
        .pipe(csv())
        .on('data', (row) => {
            tolls.push({
                operator: row.Operator,
                tollId: row.TollID,
                name: row.Name,
                latitude: parseFloat(row.Lat),
                longitude: parseFloat(row.Long),
                email: row.Email,
                prices: [row.Price1, row.Price2, row.Price3, row.Price4]
            });
        })
        .on('end', () => {
            console.log('CSV file successfully parsed');
        });
};

parseCSV(); // Call this function when the server starts

// Export the function to get tolls
exports.getTolls = (req, res) => {
    res.json(tolls);
};
