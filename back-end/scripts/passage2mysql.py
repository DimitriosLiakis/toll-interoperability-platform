#!/usr/bin/env python3
import sys
import pandas as pd
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

def insert_data(df):
    try:
        # Database connection using environment variables
        conn = mysql.connector.connect(
            host=os.getenv('HOST'),
            user=os.getenv('DUSER'),
            password=os.getenv('PASSWORD'),
            database=os.getenv('DATABASE')
        )
        
        cursor = conn.cursor()

        # Deactivate previous debts before inserting new data
        cursor.execute("""UPDATE Debt SET is_active = 0;""")

        for _, row in df.iterrows():
            cursor.execute(
                """SELECT passage_id FROM Passages WHERE timestamp=%s AND tollID=%s AND tagRef=%s AND tagHomeID=%s AND charge=%s""",
                (row['timestamp'], row['tollID'], row['tagRef'], row['tagHomeID'], row['charge'])
            )
            checker = cursor.fetchone()
            if checker:
                continue  # Skip if entry already exists in Passages
            
            # Insert new passage
            cursor.execute(
                """INSERT IGNORE INTO Passages (timestamp, tollID, tagRef, tagHomeID, charge)
                VALUES (%s, %s, %s, %s, %s)""",
                (row['timestamp'], row['tollID'], row['tagRef'], row['tagHomeID'], row['charge'])
            )
            
            # Update balance in Transceiver
            cursor.execute(
                """UPDATE Transceiver SET balance = balance - %s WHERE tagRef=%s""",
                (row['charge'], row['tagRef'])
            )

            # Retrieve company_id from Transceiver for tagRef
            cursor.execute("""SELECT company_id FROM Transceiver WHERE tagRef = %s""", (row['tagRef'],))
            transceiver_company = cursor.fetchone()
            if not transceiver_company:
                print(f"No company found for tagRef: {row['tagRef']}")
                continue
            transceiver_company = transceiver_company[0]

            # Retrieve OpID from Toll for tollID
            cursor.execute("""SELECT OpID FROM Toll WHERE Toll_id = %s""", (row['tollID'],))
            toll_op_id = cursor.fetchone()
            if not toll_op_id:
                print(f"No OpID found for Toll_id: {row['tollID']}")
                continue
            toll_op_id = toll_op_id[0]

            # Insert Debt if companies are different
            if transceiver_company != toll_op_id:
                cursor.execute(
                    """INSERT INTO Debt (toll_id, tagRef, debtor_company_id, creditor_company_id, timestamp, amount)
                    VALUES (%s, %s, %s, %s, %s, %s)""",
                    (row['tollID'], row['tagRef'], transceiver_company, toll_op_id, row['timestamp'], row['charge'])
                )

            # Update TotalDebts table with the latest debt summary
            cursor.execute(
                """
                UPDATE TotalDebts td
                JOIN (
                    SELECT debtor_company_id, creditor_company_id, SUM(amount) AS total_amount
                    FROM Debt
                    WHERE is_active = 1
                    GROUP BY debtor_company_id, creditor_company_id
                ) AS debt_summary
                ON td.debtor_company_id = debt_summary.debtor_company_id
                AND td.creditor_company_id = debt_summary.creditor_company_id
                SET td.total_amount = debt_summary.total_amount;
                """
            )
        
        # Commit all changes after processing
        conn.commit()
        print("OK, queries executed without error")

    except Error as e:
        print(f"Error: {e}")
    finally:
        # Ensure cursor and connection are properly closed
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    # CSV file path is passed as an argument to the script
    csv_file_path = sys.argv[1]
    try:
        # Read CSV data into pandas DataFrame
        data = pd.read_csv(csv_file_path)
        insert_data(data)
    except Exception as e:
        print(f"Failed to process CSV: {e}")
