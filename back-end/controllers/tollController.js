const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const { parse } = require('json2csv'); 

const tolls = [];

// Parse the CSV file
const parseCSV = () => {
    fs.createReadStream(path.join(__dirname, '../uploads/tolls.csv'))
        .pipe(csvParser())
        .on('data', (row) => {
            tolls.push({
                operator: row.Operator,
                tollId: row.TollID,
                name: row.Name,
                latitude: parseFloat(row.Lat),
                longitude: parseFloat(row.Long),
                email: row.Email,
                prices: [row.Price1, row.Price2, row.Price3, row.Price4],
            });
        })
        .on('end', () => {
            console.log('CSV file successfully parsed');
        })
        .on('error', (err) => {
            console.error('Error parsing CSV file:', err);
        });
};

parseCSV(); // Call this function when the server starts

// Export the function to get tolls
exports.getTolls = (req, res) => {
    try {
        if (tolls.length === 0) {
            return res.status(204).send(); // 204 No Content
        }

        const format = req.query.format || 'json'; // Default: json

        if (format === 'csv') {
            try {
                const csv = parse(tolls);
                res.header('Content-Type', 'text/csv');
                res.attachment('tolls.csv'); 
                return res.status(200).send(csv); // Επιστροφή σε CSV format
            } catch (csvError) {
                console.error('Error converting to CSV:', csvError);
                return res.status(500).json({ error: 'Failed to generate CSV' }); // 500 Internal Server Error
            }
        }

        res.status(200).json(tolls); // 200 Success
    } catch (error) {
        console.error('Error fetching tolls:', error);
        res.status(500).json({ error: 'Internal Server Error' }); // 500 Internal Server Error
    }
};
