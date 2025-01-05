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
        // Validate query parameters
        const validFormats = ['json', 'csv'];
        const format = req.query.format || 'json'; // Default format is 'json'

        if (!validFormats.includes(format)) {
            return res.status(400).json({ error: 'Invalid format parameter. Allowed values are "json" or "csv".' }); // 400 Bad Request
        }

        // Check if tolls data is available
        if (tolls.length === 0) {
            return res.status(204).send(); // 204 No Content
        }

        if (format === 'csv') {
            // Convert tolls data to CSV format
            const fields = ['operator', 'tollId', 'name', 'latitude', 'longitude', 'email', 'prices'];
            const opts = { fields, unwind: ['prices'] };

            try {
                const csv = parse(tolls, opts);

                // Set headers for CSV response
                res.header('Content-Type', 'text/csv');
                res.attachment('tolls.csv'); // Suggest a filename for download
                return res.status(200).send(csv); // 200 Success
            } catch (err) {
                console.error('Error generating CSV:', err);
                return res.status(500).json({ error: 'Error generating CSV' }); // 500 Internal Server Error
            }
        }

        // Default JSON response
        res.status(200).json(tolls); // 200 Success
    } catch (error) {
        console.error('Error fetching tolls:', error);
        res.status(500).json({ error: 'Internal Server Error' }); // 500 Internal Server Error
    }
};
