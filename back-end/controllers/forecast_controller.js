const { format } = require('date-fns');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const DbService = require('../dbService.js');
const json2csv = require('json2csv').parse;

const forecast_controller = async (req, res, next) => {
    try {
        const { company_id, date } = req.params;
        const formatQuery = req.query.format || 'json';

        // Έλεγχος παραμέτρων
        if (!company_id || !date) {
            return res.status(400).json({ error: 'Missing required parameters' }); // 400 Bad Request
        }

        if (!/^\d{8}$/.test(date)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYYMMDD.' }); // 400 Bad Request
        }

        const formattedDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;

        const dbService = DbService.getDbServiceInstance();
        const tolls_of_company = await dbService.tollstations(company_id);

        // 204 No Content: Αν δεν βρεθούν δεδομένα
        if (!tolls_of_company || tolls_of_company.length === 0) {
            return res.status(204).send(); // 204 No Content
        }

        // Δημιουργία δεδομένων για CSV
        const tollData = tolls_of_company.map((toll) => ({
            tollID: toll.Toll_id,
            date: formattedDate,
        }));

        const folderPath = path.join(__dirname, '../ml/input');
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        const csvData = json2csv(tollData);
        const filePath = path.join(folderPath, `company_${company_id}_passages.csv`);

        // Εγγραφή CSV αρχείου
        fs.writeFileSync(filePath, csvData);

        // Πρόκληση πρόβλεψης
        return makePassagePrediction(company_id, res, formatQuery, filePath);
    } catch (error) {
        console.error('[forecast_controller] Error:', error.message);
        return res.status(500).json({ error: 'Internal server error' }); // 500 Internal Server Error
    }
};

async function makePassagePrediction(company_id, res, formatQuery, inputCsvPath) {
    try {
        const dbService = DbService.getDbServiceInstance();
        const data_for_nop = await dbService.data_for_nop(company_id);

        // 204 No Content: Αν δεν υπάρχουν δεδομένα για την πρόβλεψη
        if (!data_for_nop) {
            return res.status(204).send(); // 204 No Content
        }

        const dict_id_input = ['AM', 'EG', 'GE', 'KO', 'MO', 'NAO', 'NO', 'OO'];

        const modelFileMapping = dict_id_input.reduce((map, companyId) => {
            const modelFolderPath = path.join(__dirname, '../models_passages');
            if (!fs.existsSync(modelFolderPath)) {
                fs.mkdirSync(modelFolderPath, { recursive: true });
            }

            const modelFilePath = path.join(modelFolderPath, `model_${companyId}.pkl`);
            map[companyId] = modelFilePath;
            return map;
        }, {});

        const outputMapping = dict_id_input.reduce((map, companyId) => {
            const folderPath = path.join(__dirname, '../ml/results');
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }

            const filePath = path.join(folderPath, `output_${companyId}_passages.csv`);
            map[companyId] = filePath;
            return map;
        }, {});

        if (!modelFileMapping[company_id]) {
            return res.status(204).send(); // 204 No Content
        }

        // Εκκίνηση Python διαδικασίας
        const pythonProcess = spawn('python3', [
            './ml/predict.py',
            '--company', company_id,
            '--input_csv', inputCsvPath,
            '--model_path', modelFileMapping[company_id],
            '--output_csv', outputMapping[company_id],
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
                return res.status(500).json({ error: 'Error making predictions' }); // 500 Internal Server Error
            }

            try {
                const result = JSON.parse(pythonOutput);
                if (!result || result.length === 0) {
                    return res.status(204).send(); // 204 No Content
                }

                if (formatQuery === 'csv') {
                    const csv = json2csv(result);
                    res.header('Content-Type', 'text/csv');
                    res.attachment(`predictions_${company_id}.csv`);
                    res.status(200).send(csv); // 200 OK (CSV)
                } else {
                    res.status(200).json(result); // 200 OK (JSON)
                }
            } catch (err) {
                console.error('[makePassagePrediction] Error parsing Python output:', err.message);
                res.status(500).json({ error: 'Invalid response from prediction engine' }); // 500 Internal Server Error
            }
        });
    } catch (error) {
        console.error('[makePassagePrediction] Error:', error.message);
        res.status(500).json({ error: 'Internal server error' }); // 500 Internal Server Error
    }
}

module.exports = forecast_controller;
