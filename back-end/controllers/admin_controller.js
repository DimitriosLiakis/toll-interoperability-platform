const DbService = require("../dbService");
const fs = require("fs");
const path = require("path");
const csvParser = require("csv-parser");
const { exec } = require("child_process");
const bcrypt = require("bcrypt");

exports.healthcheck = async (req, res) => {
    const dbServiceInstance = DbService.getDbServiceInstance();
    try {
        const stats = await dbServiceInstance.getDatabaseStats();

        res.status(200).json({
            status: "OK",
            dbconnection: process.env.DATABASE || "Unknown",
            n_stations: stats.n_stations,
            n_tags: stats.n_tags,
            n_passes: stats.n_passes,
        });
    } catch (error) {
        console.error("Healthcheck Error:", error.message);

        res.status(401).json({
            status: "failed",
            dbconnection: process.env.DATABASE || "Unknown",
            info: error.message,
        });
    }
};
  
exports.resetStations = async (req, res) => {
    const dbServiceInstance = DbService.getDbServiceInstance();
    const csvFilePath = path.join(__dirname, "../uploads/tolls.csv");

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
        // Define the predefined file path
        const filePath = path.join(__dirname, "../uploads/passages.csv");
        console.log("Using predefined file:", filePath);

        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            console.error("File not found:", filePath);
            return res.status(400).json({ status: "failed", info: "File not found: passages.csv" });
        }

        const pythonScript = path.join(__dirname, "../scripts/csv_to_mysql.py");
        console.log("Python Script Path:", pythonScript);

        // Execute the Python script to process the file
        exec(`python3 ${pythonScript} ${filePath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Python script error: ${stderr}`);
                return res.status(500).json({ status: "failed", info: stderr.trim() });
            }

            console.log(`Python script output: ${stdout}`);
            res.status(200).json({ status: "OK" });
        });
    } catch (error) {
        console.error(`Error in addPasses: ${error.message}`);
        res.status(500).json({ status: "failed", info: error.message });
    }
};
exports.getUsers = async (req, res) => {
    try {
        // Call the database service to fetch all users
        const dbServiceInstance = DbService.getDbServiceInstance();
        const users = await dbServiceInstance.getAllUsers();

        // Extract only the usernames
        const usernames = users.map(user => user.username);

        res.status(200).json({ status: "OK", users: usernames });
    } catch (error) {
        console.error("Error in getUsers:", error.message);
        res.status(500).json({ status: "failed", info: error.message });
    }
};
exports.userMod = async (req, res) => {
    const { username, passw } = req.body;

    if (!username || !passw) {
        return res.status(400).json({ status: "failed", info: "Missing username or password" });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(passw, 10);

        // Call the database service to create or update the user
        const dbServiceInstance = DbService.getDbServiceInstance();
        const result = await dbServiceInstance.createOrUpdateUser(username, hashedPassword);

        if (result.modified) {
            res.status(200).json({ status: "OK", message: `User '${username}' password updated successfully.` });
        } else if (result.created) {
            res.status(200).json({ status: "OK", message: `User '${username}' created successfully.` });
        }
    } catch (error) {
        console.error("Error in userMod:", error.message);
        res.status(500).json({ status: "failed", info: error.message });
    }
};