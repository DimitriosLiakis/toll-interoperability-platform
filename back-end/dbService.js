const dotenv = require('dotenv');
dotenv.config();  

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
}

module.exports = DbService;
