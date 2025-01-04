const { format } = require('date-fns');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const DbService = require('../dbService.js');
const json2csv = require('json2csv').parse;

const training_controller = async (req, res, next) => {
    try {
        const dbService = DbService.getDbServiceInstance();
        const company_ids = ['AM', 'EG', 'GE', 'KO', 'MO', 'NAO', 'NO', 'OO'];

        const errors = [];
        for (let i = 0; i < company_ids.length; i++) {
            const data_for_nop = await dbService.data_for_nop(company_ids[i]);
            if (!data_for_nop) {
                errors.push({ company: company_ids[i], error: 'No data found' });
                continue; // Skip training for this company
            }

            const csvFilePath = saveDataToCSV(company_ids[i], data_for_nop);

            await training_the_models(company_ids[i], csvFilePath);
        }
        if (errors.length > 0) {
            return res.status(404).json({
                error: 'Data missing for one or more companies',
                details: errors,
            });
        }
        // return res.status(200).json({ message: 'Models trained successfully for all companies' });
    } catch (error) {
        console.error('[training_controller] Error:', error.message);
        // return res.status(500).json({ error: 'Internal server error' });
    }
};

// Function to train models
async function training_the_models(company_id, dataCsvPath) {
    return new Promise((resolve, reject) => {
        try {
            console.log(`[training_the_models] Starting training for ${company_id}`);

            const pythonProcess = spawn('python3', [
                './ml/train.py',
                '--company', company_id,
                '--data_csv', dataCsvPath
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
                    console.error(`[training_the_models] Python script exited with code ${code}`);
                    return reject(new Error(`Python script exited with code ${code}`));
                }

                console.log(`[training_the_models] Training completed for ${company_id}`);
                console.log(`[training_the_models] Output: ${pythonOutput}`);
                resolve();
            });
        } catch (error) {
            console.error('[training_the_models] Error:', error.message);
            reject(error);
        }
    });
}

function saveDataToCSV(company_id, data) {
    const folderPath = path.join(__dirname, '../ml/training_data');
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, `company_${company_id}_passages.csv`);
    const csvData = json2csv(data);

    fs.writeFileSync(filePath, csvData, 'utf8');
    console.log(`[saveDataToCSV] Data for ${company_id} saved to ${filePath}`);
    return filePath;
}

module.exports = training_controller;
