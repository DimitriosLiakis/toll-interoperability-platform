const { format } = require('date-fns');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const DbService = require('../dbService.js');
const json2csv = require('json2csv').parse;

// Peak training controller
const peak_training_controller = async (req, res, next) => {
    try {
        const dbService = DbService.getDbServiceInstance();
        const company_ids = ['AM', 'EG', 'GE', 'KO', 'MO', 'NAO', 'NO', 'OO'];

        const errors = [];

        // Loop through each company ID and process data
        for (let i = 0; i < company_ids.length; i++) {
            const data_for_nop = await dbService.get_most_passages_for_date_and_company(company_ids[i]);

            // Flatten the array if necessary
            const flatData = data_for_nop.flat(); // This will flatten the outer array

            // If no data is found, log an error and skip
            if (!flatData || flatData.length === 0) {
                errors.push({ company: company_ids[i], error: 'No data found' });
                continue;
            }

            // Save data to CSV and pass file path to training function
            const csvFilePath = saveDataToCSV(company_ids[i], flatData);
            await training_the_models(company_ids[i], csvFilePath);
        }

        // Return error if data is missing for any company
        if (errors.length > 0) {
            return res.status(404).json({
                error: 'Data missing for one or more companies',
                details: errors,
            });
        }

        // Only send response after all processing is complete
        return res.status(200).json({ message: 'Models trained successfully for all companies' });
    } catch (error) {
        console.error('[peak_training_controller] Error:', error.message);
        // Handle already sent response error
        if (!res.headersSent) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};



// Function to train models using a Python script
async function training_the_models(company_id, dataCsvPath) {
    return new Promise((resolve, reject) => {
        try {
            // console.log(`[training_the_models] Starting training for ${company_id}`);

            // Spawn the Python process for training
            const pythonProcess = spawn('python3', [
                './ml/train_peak_hours.py',
                '--company', company_id,
                '--data_csv', dataCsvPath
            ]);

            let pythonOutput = '';

            // Capture stdout data from the Python process
            pythonProcess.stdout.on('data', (data) => {
                pythonOutput += data.toString();
            });

            // Capture stderr data from the Python process
            pythonProcess.stderr.on('data', (data) => {
                console.error(`[Python STDERR]: ${data.toString()}`);
            });

            // On process close, check the exit code
            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    console.error(`[training_the_models] Python script exited with code ${code}`);
                    return reject(new Error(`Python script exited with code ${code}`));
                }

                // console.log(`[training_the_models] Training completed for ${company_id}`);
                // console.log(`[training_the_models] Output: ${pythonOutput}`);
                resolve();
            });
        } catch (error) {
            console.error('[training_the_models] Error:', error.message);
            reject(error);
        }
    });
}

// Function to save data to CSV
function saveDataToCSV(company_id, data) {
    const folderPath = path.join(__dirname, '../ml/training_data_peak_hours');
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, `company_${company_id}_passages.csv`);

    // Log the raw data to see what you're working with
    console.log('Data from database:', data);

    // Flatten the data and format passage_date to only include the date (no hour)
    const flattenedData = data.map(item => {
        // Log each individual passage_date to check its value
        // console.log('Processing passage_date:', item.passage_date);

        // Ensure the passage_date is a valid date before formatting
        let formattedDate = null;
        if (item.passage_date) {
            // Try to create a valid date object
            const parsedDate = new Date(item.passage_date);
            if (!isNaN(parsedDate.getTime())) { // Check if the parsed date is valid
                formattedDate = format(parsedDate, 'yyyy-MM-dd');
            } else {
                console.error('Invalid date:', item.passage_date);
            }
        } else {
            console.error('Missing passage_date:', item.passage_date);
        }

        return {
            passage_date: formattedDate, // Only keep the date if valid
            company: item.company,
            hour_of_day: item.hour_of_day
        };
    }).filter(item => item.passage_date !== null); // Remove any entries with invalid dates

    // Convert the flattened data to CSV
    const csvData = json2csv(flattenedData);

    fs.writeFileSync(filePath, csvData, 'utf8');
    // console.log(`[saveDataToCSV] Data for ${company_id} saved to ${filePath}`);
    return filePath;
}



module.exports = peak_training_controller;
