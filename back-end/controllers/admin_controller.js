const dbService = require("../dbService");
const fs = require("fs");
const path = require("path");
const csvParser = require("csv-parser");
const { exec } = require("child_process");

exports.healthcheck = async (req, res) => {
  try {
    // Fetch database stats
    const { connectionString, stats } = await dbService.getDatabaseStats();

    res.status(200).json({
      status: "OK",
      dbconnection: connectionString,
      n_stations: stats.n_stations,
      n_tags: stats.n_tags,
      n_passes: stats.n_passes,
    });
  } catch (error) {
    console.error("Healthcheck Error:", error.message);

    res.status(401).json({
      status: "failed",
      dbconnection: error.connectionString || "Unknown",
    });
  }
};

exports.resetStations = async (req, res) => {
    const dbServiceInstance = DbService.getDbServiceInstance();
    const csvFilePath = path.join(__dirname, "../data/tollstations2024.csv");

    try {
        // Read and parse the CSV file
        const stationsData = await readCSVFile(csvFilePath);

        // Initialize the toll stations in the database
        await dbServiceInstance.resetTollStations(stationsData);

        res.status(200).json({ status: "OK" });
    } catch (error) {
        console.error("Error resetting toll stations:", error.message);
        res.status(500).json({ status: "failed", info: error.message });
    }
};

// Helper function to read and parse CSV file
const readCSVFile = (filePath) => {
    return new Promise((resolve, reject) => {
        const data = [];
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on("data", (row) => {
                // Parse each row and ensure field names match the database columns
                data.push({
                    OpID: row.OpID,
                    Operator: row.Operator,
                    TollID: row.TollID,
                    Name: row.Name,
                    PM: row.PM,
                    Locality: row.Locality,
                    Road: row.Road,
                    Lat: parseFloat(row.Lat),
                    Long: parseFloat(row.Long),
                    Email: row.Email,
                    Price1: parseFloat(row.Price1),
                    Price2: parseFloat(row.Price2),
                    Price3: parseFloat(row.Price3),
                    Price4: parseFloat(row.Price4),
                });
            })
            .on("end", () => resolve(data))
            .on("error", (err) => reject(err));
    });
};


exports.resetPasses = async (req, res) => {
    const dbServiceInstance = DbService.getDbServiceInstance();

    try {
        // Clear Debt and Passages tables
        await dbServiceInstance.resetPasses();

        // Optional: Initialize the admin account
        await dbServiceInstance.initializeAdminAccount();

        res.status(200).json({ status: "OK" });
    } catch (error) {
        console.error("Error resetting passes:", error.message);
        res.status(500).json({ status: "failed", info: error.message });
    }
};

exports.addPasses = async (req, res) => {
    try {
        // Ensure a file was uploaded
        if (!req.file) {
            return res.status(400).json({ status: "failed", info: "No file uploaded" });
        }

        const filePath = req.file.path; // Path to the uploaded file
        const pythonScript = path.join(__dirname, "../scripts/add_passages.py"); // Path to the Python script

        // Execute the Python script
        exec(`python3 ${pythonScript} ${filePath}`, (error, stdout, stderr) => {
            // Handle errors from the Python script
            if (error) {
                console.error(`Python script error: ${stderr}`);
                return res.status(500).json({ status: "failed", info: stderr.trim() });
            }

            // Log Python script output and return success
            console.log(`Python script output: ${stdout}`);
            res.status(200).json({ status: "OK" });

            // Remove the uploaded file after processing
            fs.unlink(filePath, (err) => {
                if (err) console.error(`Failed to delete file: ${filePath}`);
            });
        });
    } catch (error) {
        console.error(`Error in addPasses: ${error.message}`);
        res.status(500).json({ status: "failed", info: error.message });
    }
};