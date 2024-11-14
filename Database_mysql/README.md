Copying the Draft_B Database to Your Local Machine

This repository contains the SQL schema and data files for the Draft_B database. Follow these steps to set up a local copy of the database using the provided .sql files.
Files Included

    schema.sql: Contains the structure of the database, including tables, indexes, and constraints.
    data.sql: Contains the actual data for the tables in the database.

Requirements

You will need MySQL Server installed on your local machine (MySQL 5.7 or later is recommended). You will also need a MySQL client, such as MySQL Workbench or the MySQL command-line client, to execute the SQL scripts.
Steps to Set Up the Database Locally

    Install MySQL
    If you haven't already, download and install MySQL Server from MySQL Downloads. After installation, ensure that you can access MySQL via the command line or MySQL Workbench.

    Clone the Repository
    First, clone this repository to your local machine using Git. In your terminal, run:
    git clone https://github.com/your_username/your_repository_name.git
    Then, navigate into the project folder:
    cd your_repository_name

    Create a New Database in MySQL
    Open your MySQL client (either through the command line or MySQL Workbench) and create a new database to import the schema and data into. Run the following SQL command to create the draft_b database:
    CREATE DATABASE draft_b;

    Import the Database Schema
    Next, you need to import the schema (the structure of the database). From your terminal, navigate to the folder where the .sql files are located and run the following command:
    mysql -u root -p draft_b < schema.sql
    You will be prompted for your MySQL root password. Once entered, this command will create all the tables and indexes according to the schema in the draft_b database.

    Import the Data
    After the schema is imported, you need to add the data. Run the following command:
    mysql -u root -p draft_b < data.sql
    Again, you will be prompted for your MySQL root password. This will insert all the data into the corresponding tables of the draft_b database.

    Verify the Database
    Once the import process is complete, verify that the tables and data were successfully imported. Log into MySQL using:
    mysql -u root -p
    Then, select the draft_b database by running:
    USE draft_b;
    To check the list of tables, run:
    SHOW TABLES;
    You should see all the tables from the schema. To verify that data has been imported, you can run a query like:
    SELECT * FROM some_table LIMIT 10;
    Replace some_table with one of the actual table names.

Troubleshooting

    Error: Access Denied
    If you encounter an "Access Denied" error, ensure that you're using the correct MySQL username and password. You can specify the user with the -u flag if needed.

    Error: Database Already Exists
    If the draft_b database already exists on your MySQL instance, you can either drop it and recreate it by running:
    DROP DATABASE draft_b;
    CREATE DATABASE draft_b;

    Import Issues
    If the import fails, check for any syntax errors in the .sql files or missing dependencies (e.g., foreign key constraints) in the schema.


