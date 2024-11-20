#!/usr/bin/env python3
import sys
import pandas as pd
import mysql.connector
from mysql.connector import Error

def insert_data(df):
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='2002',
            database='draft_b'
        )
        cursor = conn.cursor()
        
        for _, row in df.iterrows():
            cursor.execute(
                """select passage_id from Passages where timestamp=%s AND tollID=%s AND tagRef=%s AND tagHomeID=%s AND charge=%s""",
                (row['timestamp'], row['tollID'], row['tagRef'], row['tagHomeID'], row['charge'])                
            )
            checker = cursor.fetchone()
            if checker:
                continue
    
            cursor.execute(
                """
                INSERT IGNORE INTO Passages (timestamp, tollID, tagRef, tagHomeID, charge)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (row['timestamp'], row['tollID'], row['tagRef'], row['tagHomeID'], row['charge'])
            )
            
            cursor.execute(
                """
                UPDATE Transceiver 
                SET balance = balance - %s
                WHERE tagRef=%s
                """,
                (row['charge'], row['tagRef'])
            )

            # Retrieve company_id from Transceiver for tagRef
            cursor.execute(
                """
                SELECT company_id
                FROM Transceiver
                WHERE tagRef = %s
                """,
                (row['tagRef'],)
            )
            transceiver_company = cursor.fetchone()
            if not transceiver_company:
                print(f"No company found for tagRef: {row['tagRef']}")
                continue
            transceiver_company = transceiver_company[0]

            # Retrieve OpID (Operator ID) from Toll for tollID
            cursor.execute(
                """
                SELECT OpID
                FROM Toll
                WHERE Toll_id = %s
                """,
                (row['tollID'],)
            )
            toll_op_id = cursor.fetchone()
            if not toll_op_id:
                print(f"No OpID found for Toll_id: {row['tollID']}")
                continue
            toll_op_id = toll_op_id[0]

            # Check if companies are different and insert debt if necessary
            if transceiver_company != toll_op_id:
                cursor.execute(
                    """
                    INSERT INTO Debt (toll_id, tagRef, debtor_company_id, creditor_company_id, timestamp, amount)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (row['tollID'], row['tagRef'], transceiver_company, toll_op_id, row['timestamp'], row['charge'])
                )


            
        conn.commit()
        print("OK")  # Output "OK" if insert was successful

    except Error as e:
        print(f"Error: {e}")

    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    csv_file_path = sys.argv[1]
    data = pd.read_csv(csv_file_path)
    insert_data(data)
