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
const simulateDbError = () => {
    throw new Error('Simulated Database error');
  };
class DbService {
    // Define static instance to handle singleton pattern
    static instance = null;

    static getDbServiceInstance() {
        if (!this.instance) {
            this.instance = new DbService();
        }
        return this.instance;
    }
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


    async getUser(user_email) {
        try {
            const query = `SELECT * FROM user_login WHERE user_email = ?`;
            const [rows] = await promisePool.query(query, [user_email]);
            return rows[0];
        } catch (error) {
            console.error('Error in getUser:', error.message);
        }
    }

    async tollstations(company_id) {
        try {
            const query = `
                SELECT Toll_id FROM Toll 
                WHERE OpID= ? ;`
            const [rows] = await promisePool.query(query, company_id);
            return rows;
        } catch (error) {
            console.error('Error in getRecordsBetweenIds:', error.message);
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

            return rows;
        } catch (error) {
            console.error('Error in data_for_nop:', error.message);
            throw error;
        }
    }

    async data_for_peak_hour(company_id) {
        try {
            const query = `
                SELECT 
                    DATE_FORMAT(p.timestamp, '%Y-%m-%d') AS passage_date, 
                    HOUR(p.timestamp) AS hour, 
                    t.OpID AS OpID, 
                    COUNT(p.passage_id) AS passage_count
                FROM 
                    Passages p
                JOIN 
                    Toll t ON p.tollID = t.Toll_id
                WHERE 
                    t.OpID = ? 
                GROUP BY 
                    passage_date, hour, t.OpID
                ORDER BY 
                    passage_date, hour, t.OpID;
            `;
            
            // Execute the query with company_id
            const [rows] = await promisePool.query(query, company_id);
    
            // console.log('Data fetched from DB:', rows);
            return rows;
        } catch (error) {
            console.error('Error in data_for_peak_hour:', error.message);
            throw error;
        }
    }
    

    async peak_input_data(company_id, DateFrom, DateTo) {
        try {
            const query = `
                SELECT DATE(p.timestamp) AS passage_date, t.OpID as company
                FROM Passages p 
                JOIN Toll t ON p.tollID = t.Toll_id
                WHERE t.OpID = ? 
                AND DATE(p.timestamp) BETWEEN ? AND ?;
            `;
            // Pass parameters as an array
            const rows = await promisePool.query(query, [company_id, DateFrom, DateTo]);
    
            return rows;
        } catch (error) {
            console.error('Error in data_for_nop:', error.message);
            throw error;
        }
    }
    
    async get_most_passages_for_date_and_company(company_id) {
        try {
            const query = `
                SELECT 
    grouped.passage_date,
    grouped.company,
    grouped.hour_of_day
FROM (
    SELECT 
        DATE(p.timestamp) AS passage_date,
        t.OpID AS company,
        HOUR(p.timestamp) AS hour_of_day,
        COUNT(*) AS passages_count
    FROM Passages p
    JOIN Toll t ON p.tollID = t.Toll_id
    GROUP BY passage_date, company, hour_of_day
) AS grouped
WHERE grouped.company = ?
  AND (grouped.passage_date, grouped.company, grouped.passages_count) IN (
      SELECT 
          passage_date,
          company,
          MAX(passages_count) AS max_passages_count
      FROM (
          SELECT 
              DATE(p.timestamp) AS passage_date,
              t.OpID AS company,
              HOUR(p.timestamp) AS hour_of_day,
              COUNT(*) AS passages_count
          FROM Passages p
          JOIN Toll t ON p.tollID = t.Toll_id
          GROUP BY passage_date, company, hour_of_day
      ) AS subquery
      GROUP BY passage_date, company
  )
ORDER BY grouped.passage_date;

            `;
            const rows = await promisePool.query(query, company_id);
            return rows;
        } catch (error) {
            console.error('Error in getting most passages for date and company:', error.message);
            throw error;
        }
    }
    
}
module.exports = DbService;
