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
                """
                INSERT INTO Passages (timestamp, tollID, tagRef, tagHomeID, charge)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (row['timestamp'], row['tollID'], row['tagRef'], row['tagHomeID'], row['charge'])
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
