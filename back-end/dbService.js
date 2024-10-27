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

    async passing_toll(input1, input2) {
        try {
            console.log("Received Transceiver ID for query:", input1);
            console.log("Received Toll ID for query:", input2);

            if (!input1 || !input2) {
                throw new Error("Both input1 (Transceiver ID) and input2 (Toll ID) must be provided");
            }

            const response = await new Promise((resolve, reject) => {
                // Insert a record into Passage table
                const passageQuery = `INSERT INTO Passage (toll_id, transceiver_id) VALUES (?, ?)`;
                connection.query(passageQuery, [input2, input1], (err, passageResults) => {
                    if (err) {
                        console.error("Error inserting into Passage:", err);
                        return reject(new Error("Failed to insert into Passage"));
                    }
                    console.log("Passage record inserted:", passageResults);

                    // Query for operator_id from Toll table
                    const tollQuery = `SELECT operator_id FROM Toll WHERE toll_id = ?`;
                    connection.query(tollQuery, [input2], (err, tollResults) => {
                        if (err) {
                            console.error("Error fetching Toll data:", err);
                            return reject(new Error("Failed to retrieve Toll data"));
                        }

                        if (!tollResults.length) {
                            return reject(new Error("No Toll entry found for the given toll_id"));
                        }

                        const operatorId = tollResults[0].operator_id;

                        // Query for company_id from Transceiver table
                        const transceiverQuery = `SELECT company_id FROM Transceiver WHERE transceiver_id = ?`;
                        connection.query(transceiverQuery, [input1], (err, transceiverResults) => {
                            if (err) {
                                console.error("Error fetching Transceiver data:", err);
                                return reject(new Error("Failed to retrieve Transceiver data"));
                            }

                            if (!transceiverResults.length) {
                                return reject(new Error("No Transceiver entry found for the given transceiver_id"));
                            }

                            const companyId = transceiverResults[0].company_id;

                            // Check if company_id matches operator_id
                            if (companyId === operatorId) {
                                console.log("No debt insertion required: company_id matches operator_id");
                                return resolve({ passageResults, message: "No new debt needed as company_id matches operator_id" });
                            }

                            // If company_id does not match operator_id, create a new debt entry
                            const debtQuery = `INSERT INTO Debt (transceiver_id, toll_id, amount) VALUES (?, ?, ?)`;
                            const debtAmount = calculateDebtAmount(input1, input2); // Assuming this function calculates debt
                            connection.query(debtQuery, [input1, input2, debtAmount], (err, debtResults) => {
                                if (err) {
                                    console.error("Error inserting new debt:", err);
                                    return reject(new Error("Failed to insert new debt"));
                                }
                                console.log("Debt inserted successfully:", debtResults);
                                resolve({ passageResults, debtResults });
                            });
                        });
                    });
                });
            });

            return response;
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    }
}

module.exports = DbService;
