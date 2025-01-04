import csv

# Define the CSV and output SQL file paths
csv_file_path = 'tollstations2024.csv'  # Ensure this is the correct CSV file path
sql_file_path = 'insert_toll_data.sql'  # The output SQL file path

# Open the CSV file and SQL output file
with open(csv_file_path, mode='r', newline='', encoding='utf-8-sig') as csv_file, \
     open(sql_file_path, mode='w', encoding='utf-8') as sql_file:
    
    reader = csv.DictReader(csv_file, delimiter=',')  # Adjust delimiter if needed
    print("CSV Headers:", reader.fieldnames)  # Show headers for debugging

    # Define the SQL INSERT template with Toll_id included
    for row in reader:
        print("Current row:", row)  # Print each row for debugging
        
        # Build the SQL statement
        try:
            sql = f"""
            INSERT INTO draft_b.Toll (Toll_id, Latitude, Longitude, Name, Locality, Road, Operator, OpID, Email, Price1, Price2, Price3, Price4)
            VALUES ('{row['TollID']}', {row['Lat']}, {row['Long']}, '{row['Name']}', '{row['Locality']}', 
                    '{row['Road']}', '{row['Operator']}', '{row['OpID']}', '{row['Email']}', 
                    {row['Price1']}, {row['Price2']}, {row['Price3']}, {row['Price4']});
            """
            sql_file.write(sql.strip() + "\n")  # Write each SQL statement with a newline
        except KeyError as e:
            print(f"KeyError: {e} - Check if column names in the CSV match table column names.")
            continue  # Skip rows with issues
        except Exception as e:
            print(f"Error: {e} - Issue with row data.")
            continue

print(f"SQL insert statements written to {sql_file_path}")

