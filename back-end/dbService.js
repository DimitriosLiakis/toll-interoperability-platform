const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');
const path = require('path'); // To handle folder paths
const { Parser } = require('json2csv');

const mysql = require('mysql2');

// Create a connection pool instead of a single connection
const pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.DUSER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT
});

// Promisify the pool.query method for easier use with async/await
const promisePool = pool.promise();

class DbService {
    // Define static instance to handle singleton pattern
    static instance = null;

    static getDbServiceInstance() {
        if (!this.instance) {
            this.instance = new DbService();
        }
        return this.instance;
    }

    // Fetch the last passage_id from the database
    async getLastPassageId() {
        try {
            console.log('Fetching last passage_id...');
            const query = `SELECT MAX(passage_id) AS lastPassageId FROM Passages`;
            const [rows] = await promisePool.query(query); // Use promisePool.query instead of this.pool.query
            console.log('Query result:', rows);
            return rows[0]?.lastPassageId || 0; // Return 0 if no records exist
        } catch (error) {
            console.error('Error in getLastPassageId:', error.message);
            throw error;
        }
    }

    // Fetch records between the given passage_id
    async getRecordsBetweenIds(lastPId_before) {
        try {
            const query = `
                SELECT * FROM Passages 
                WHERE passage_id > ? 
                ORDER BY passage_id`;
            const [rows] = await promisePool.query(query, [lastPId_before]);
            return rows;
        } catch (error) {
            console.error('Error in getRecordsBetweenIds:', error.message);
            throw error;
        }
    }
    async getRecordsBetweenDate(tollStationID, dateFrom, dateTo) {
        try {
            const query = `
                SELECT passage_id, timestamp, tollID, tagRef, tagHomeID, charge
                FROM Passages
                WHERE tollID = ? AND DATE(timestamp) BETWEEN ? AND ?`;
            const [rows] = await promisePool.query(query, [tollStationID, dateFrom, dateTo]);
            return rows;
        } catch (error) {
            console.error('Error in getRecordsBetweenDate:', error.message);
            throw error;
        }
    }

    async getPassesBetween2companies(tollOpID, tagOpID, dateFrom, dateTo) {
        try {
            const query = `
                SELECT 
                    COUNT(*) AS nPasses,
                    COALESCE(SUM(amount), 0) AS passesCost
                FROM Debt
                WHERE creditor_company_id = ? 
                  AND debtor_company_id = ? 
                  AND DATE(timestamp) BETWEEN ? AND ?;
            `;
            const [rows] = await promisePool.query(query, [tollOpID, tagOpID, dateFrom, dateTo]);
            return rows[0];
        } catch (error) {
            console.error('Error in getPassesBetween2companies:', error.message);
            throw error;
        }
    }

    async getDebtBetween2companies(tollOpID, tagOpID, dateFrom, dateTo) {
        try {
            const query = `
            SELECT debtor_company_id, count(*) AS nPasses, COALESCE(SUM(amount), 0) AS passesCost
            FROM Debt
            WHERE creditor_company_id = ? 
            AND debtor_company_id = ? 
            AND DATE(timestamp) BETWEEN ? AND ?;
            `;
            const [rows] = await promisePool.query(query, [tollOpID, tagOpID, dateFrom, dateTo]);
            return rows;
        }
        catch (error) {
            console.error('Error in getDebtBetween2companies:', error.message);
            throw error;
        }
    }

    async getpassAnalysis(stationOpID, tagOpID, dateFrom, dateTo) {
        try {
            const query = `
                SELECT 
                    p.passage_id AS passID,
                    p.tollID AS stationID,
                    p.timestamp,
                    p.tagRef AS tagID,
                    p.charge AS passCharge,
                    tl.Toll_id AS tollID
                FROM 
                    Passages p
                JOIN 
                    Transceiver t ON p.tagRef = t.tagRef
                JOIN 
                    Toll tl ON p.tollID = tl.Toll_id
                WHERE 
                    t.company_id = ? 
                    AND DATE(p.timestamp) BETWEEN ? AND ?
            `;
            const [rows] = await promisePool.query(query, [tagOpID, dateFrom, dateTo]);
            return rows;
        } catch (error) {
            console.error('Error in getpassAnalysis:', error.message);
            throw error;
        }
    }


    async data_for_nop(company_id) {
        try {
            const query = `
                SELECT 
                    p.tollID, 
                    DATE_FORMAT(DATE(p.timestamp), '%Y-%m-%d') AS date, 
                    COUNT(*) AS total_passages
                FROM 
                    Passages p
                JOIN 
                    Toll t ON p.tollID = t.Toll_id
                JOIN 
                    Company c ON t.OpID = c.company_id
                WHERE 
                    c.company_id = ?
                GROUP BY 
                    p.tollID, date;

            `;
            const [rows] = await promisePool.query(query, company_id);
    
            if (rows.length > 0) {
                // Define custom column names
                const fields = [
                    { label: 'tollID', value: 'tollID' },
                    { label: 'date', value: 'date' },
                    { label: 'total_passages', value: 'total_passages' },
                ];
    
                const csvParser = new Parser({ fields });
                const csvData = csvParser.parse(rows);
    
                const folderPath = path.join(__dirname, './ml/data');
                if (!fs.existsSync(folderPath)) {
                    fs.mkdirSync(folderPath, { recursive: true }); // Create folder if it doesn't exist
                }
    
                // Save the CSV file to the specified folder
                const fileName = `company_${company_id}_passages.csv`;
                const filePath = path.join(folderPath, fileName);
                fs.writeFileSync(filePath, csvData);
    
                console.log(`Data successfully saved to ${filePath}`);
            } else {
                console.log('No data found for the given company_id');
            }
    
            return rows;
        } catch (error) {
            console.error('Error in data_for_nop:', error.message);
            throw error;
        }
    }
    
}
module.exports = DbService;
