const { format } = require('date-fns');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const DbService = require('../dbService.js');
const json2csv = require('json2csv').parse;

const forecast_controller = async (req, res, next) => {
    try {
        const { company_id, type } = req.params;
        const formatQuery = req.query.format || 'json';

        // Validate required parameters
        if (!company_id || !type) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // if (!['500', 'profit'].includes(type)) {
        //     return res.status(400).json({ error: 'Invalid type parameter' });
        // }
      
        return makePassagePrediction(company_id, res, formatQuery);
    } catch (error) {
        console.error('[forecast_controller] Error:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

async function makePassagePrediction(company_id, res, formatQuery) {
    try {
        const dbService = DbService.getDbServiceInstance();
        const data_for_nop = await dbService.data_for_nop(company_id);

        if (!data_for_nop) {
            return res.status(404).json({ error: 'No data found for the company' });
        }

        const dict_id_input = ['AM', 'EG', 'GE', 'KO', 'MO', 'NAO', 'NO', 'OO'];

        const fileMapping = dict_id_input.reduce((map, companyId) => {
            const folderPath = path.join(__dirname, '../ml/data'); // Define the base folder path
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true }); // Create folder if it doesn't exist
            }

            const filePath = path.join(folderPath, `company_${companyId}_passages.csv`);
            map[companyId] = filePath;
            return map;
        }, {});

        const modelFileMapping = dict_id_input.reduce((map, companyId) => {
            const modelFolderPath = path.join(__dirname, '../models');
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

            const filePath = path.join(folderPath, `output_${companyId}_passages.csv`); // Corrected the output file naming
            map[companyId] = filePath;
            return map;
        }, {});

        if (!fileMapping[company_id] || !modelFileMapping[company_id]) {
            return res.status(404).json({ error: `No data or model found for company: ${company_id}` });
        }

        // Spawn the Python process with the correct paths and output file
        const pythonProcess = spawn('python3', [
            './ml/predict.py', 
            '--company', company_id,
            '--input_csv', fileMapping[company_id],
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
                    return res.status(404).json({ error: 'No predictions found' });
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

module.exports = forecast_controller;
