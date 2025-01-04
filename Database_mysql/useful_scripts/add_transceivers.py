import csv
import mysql.connector
import random

# MySQL connection setup
db_config = {
    'host': 'localhost',  # Change if different
    'user': 'root',  # Replace with your MySQL username
    'password': '2002',  # Replace with your MySQL password
    'database': 'draft_b'  # Replace with your database name
}

# Connect to MySQL
connection = mysql.connector.connect(**db_config)
cursor = connection.cursor()

# Function to insert data into Transceiver table
def insert_transceiver(tag_ref, company_id, balance):
    # Check if tagRef already exists
    cursor.execute("SELECT COUNT(*) FROM Transceiver WHERE tagRef = %s", (tag_ref,))
    count = cursor.fetchone()[0]
    
    if count == 0:
        query = """
        INSERT INTO Transceiver (tagRef, company_id, balance) 
        VALUES (%s, %s, %s)
        """
        cursor.execute(query, (tag_ref, company_id, balance))
        connection.commit()
        print(f"Inserted tagRef: {tag_ref}, company_id: {company_id}, balance: {balance}")
    else:
        print(f"Duplicate tagRef found: {tag_ref}, skipping insert.")

# Read CSV and insert data
csv_file_path = 'passes-sample.csv'  # Replace with your CSV file path
with open(csv_file_path, mode='r') as file:
    csv_reader = csv.DictReader(file)
    
    for row in csv_reader:
        tag_ref = row['tagRef']
        tag_home_id = row['tagHomeID']
        # Random balance between 0 and 80
        balance = round(random.uniform(0, 80), 2)
        
        # Insert into Transceiver table
        insert_transceiver(tag_ref, tag_home_id, balance)

# Close the MySQL connection
cursor.close()
connection.close()

print("Inserts completed.")

