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
            const response = await new Promise((resolve, reject) => {
                let query = '';
                let queryParams = [];
    
                // Check if the input is a number (assume it's transceiver_id) or a string (assume it's driver_name)
                if (isNaN(input)) {
                    // Input is a driver's name
                    query = `
                        SELECT DISTINCT c.* 
                        FROM Transceiver t
                        JOIN Company c ON t.company_id = c.company_id
                        JOIN Driver d ON t.driver_id = d.driver_id
                        WHERE d.name = ?;
                    `;
                    queryParams = [input];
                } else {
                    // Input is a transceiver_id
                    query = `
                        SELECT c.* 
                        FROM Transceiver t
                        JOIN Company c ON t.company_id = c.company_id
                        WHERE t.transceiver_id = ?;
                    `;
                    queryParams = [input];
                }
    
                // Execute the query using parameterized input to prevent SQL injection
                connection.query(query, queryParams, (err, results) => {
                    if (err) {
                        reject(new Error(err.message));
                    } else {
                        resolve(results);
                    }
                });
            });
    
            return response;
        } catch (error) {
            console.log(error);
        }
    }
    
}
module.exports = DbService;
