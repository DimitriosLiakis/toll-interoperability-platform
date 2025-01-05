const { format } = require('date-fns');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const DbService = require('../dbService.js');
const json2csv = require('json2csv').parse;

const peak_controller = async (req, res, next) => {
    try {
        const { company_id, DateFrom, DateTo } = req.params;
        const formatQuery = req.query.format || 'json';

        // Validate required parameters
        if (!company_id || !DateFrom || !DateTo) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Ensure DateFrom and DateTo are in correct format (YYYYMMDD)
        if (!/^\d{8}$/.test(DateFrom) || !/^\d{8}$/.test(DateTo)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYYMMDD.' });
        }

        // Convert DateFrom and DateTo to Date objects for comparison
        const startDate = new Date(`${DateFrom.slice(0, 4)}-${DateFrom.slice(4, 6)}-${DateFrom.slice(6, 8)}`);
        const endDate = new Date(`${DateTo.slice(0, 4)}-${DateTo.slice(4, 6)}-${DateTo.slice(6, 8)}`);

        // Generate array of dates between DateFrom and DateTo
        const dateArray = [];
        let currentDate = startDate;
        while (currentDate <= endDate) {
            dateArray.push(currentDate.toISOString().slice(0, 10)); // YYYY-MM-DD format
            currentDate.setDate(currentDate.getDate() + 1); // Increment by one day
        }

        // Fetch toll data from the database
        const dbService = DbService.getDbServiceInstance();
        const tolls_of_company = await dbService.peak_input_data(company_id, DateFrom, DateTo);

        // Create CSV data by iterating over each toll and each date
        const csvData = [];
        tolls_of_company.forEach(toll => {
            dateArray.forEach(dates => {
                csvData.push({
                    passage_date: dates,
                    company: company_id,
                });
            });
        });

        const folderPath = path.join(__dirname, '../ml/input_peak_hours');
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true }); 
        }

        const csvData1 = json2csv(csvData);
        const filePath = path.join(folderPath, `company_${company_id}_passages.csv`);

        // Write the CSV file
        fs.writeFileSync(filePath, csvData1);

        // Proceed with the prediction logic after creating the CSV
        return makePeakHourPrediction(company_id, res, formatQuery, filePath);
    } catch (error) {
        console.error('[forecast_controller] Error:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


async function makePeakHourPrediction(company_id, res, formatQuery, inputCsvPath) {
    try {
        const dbService = DbService.getDbServiceInstance();
        const data_for_nop = await dbService.data_for_peak_hour(company_id);

        if (!data_for_nop) {
            return res.status(204).json({ error: 'No data found for the company' });
        }

        const dict_id_input = ['AM', 'EG', 'GE', 'KO', 'MO', 'NAO', 'NO', 'OO'];

        const modelFileMapping = dict_id_input.reduce((map, companyId) => {
            const modelFolderPath = path.join(__dirname, '../models_peak_hours');
            if (!fs.existsSync(modelFolderPath)) {
                fs.mkdirSync(modelFolderPath, { recursive: true });
            }

            const modelFilePath = path.join(modelFolderPath, `model_${companyId}.pkl`);
            map[companyId] = modelFilePath;
            return map;
        }, {});

        const outputMapping = dict_id_input.reduce((map, companyId) => {
            const folderPath = path.join(__dirname, '../ml/results_peak_hour');
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }

            const filePath = path.join(folderPath, `output_${companyId}_passages.csv`);
            map[companyId] = filePath;
            return map;
        }, {});

        if (!modelFileMapping[company_id]) {
            return res.status(204).json({ error: `No model found for company: ${company_id}` });
        }
        const pythonProcess = spawn('python3', [
            './ml/predict_peak_hours.py', 
            '--company', company_id,
            '--input_csv', inputCsvPath,  // Using the generated CSV
            '--model_path', modelFileMapping[company_id],
            '--output_csv', outputMapping[company_id]
        ]);

        let pythonOutput = '';

        pythonProcess.stdout.on('data', (data) => {
            pythonOutput += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`[Python STDERR]: ${data.toString()}`);
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`[makePassagePrediction] Python script exited with code ${code}`);
                return res.status(500).json({ error: 'Error making predictions' });
            }

            try {
                const result = JSON.parse(pythonOutput);
                if (!result || result.length === 0) {
                    return res.status(204).json({ error: 'No predictions found' });
                }

                if (formatQuery === 'csv') {
                    const csv = json2csv(result);
                    res.header('Content-Type', 'text/csv');
                    res.send(csv);
                } else {
                    res.json(result);
                }
            } catch (err) {
                console.error('[makePassagePrediction] Error parsing Python output:', err.message);
                res.status(500).json({ error: 'Invalid response from prediction engine' });
            }
        });
    } catch (error) {
        console.error('[makePassagePrediction] Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = peak_controller;
