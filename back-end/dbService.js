const dotenv = require('dotenv');
dotenv.config();  

const mysql = require('mysql2');


const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DUSER, 
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT
});

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.log('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the MySQL database');
    }
});

class DbService {
    // Define static instance to handle singleton pattern
    static instance = null;

    static getDbServiceInstance() {
        if (!this.instance) {
            this.instance = new DbService();
        }
        return this.instance;
    }
    
    async getProvider(input) {
        try {
            console.log("Received input for query:", input);  // Log input
            const response = await new Promise((resolve, reject) => {
                let query = '';
                let queryParams = [];
    
                // Check if input is a number for transceiver_id or a string for driver_name
                if (isNaN(input)) {
                    query = `
                        SELECT DISTINCT c.* 
                        FROM Transceiver t
                        JOIN Company c ON t.company_id = c.company_id
                        JOIN Driver d ON t.driver_id = d.driver_id
                        WHERE d.name = ?;
                    `;
                    queryParams = [input];
                } else {
                    query = `
                        SELECT c.* 
                        FROM Transceiver t
                        JOIN Company c ON t.company_id = c.company_id
                        WHERE t.transceiver_id = ?;
                    `;
                    queryParams = [input];
                }
    
                console.log("Executing query:", query);  // Log query
                console.log("With parameters:", queryParams);  // Log query parameters
    
                // Execute the query
                connection.query(query, queryParams, (err, results) => {
                    console.log("Query executed"); // Log execution attempt
                    if (err) {
                        console.error("Error during query execution:", err);  // Log error details
                        reject(new Error(err.message));
                    } else {
                        console.log("Query results:", results);  // Log results
                        resolve(results);
                    }
                });
            });
    
            return response;
        } catch (error) {
            console.log("Error:", error);
            throw error;  // Ensure the error propagates
        }
    }
    
    
}     
module.exports = DbService;
