Backend Setup Guide

This project is a backend system built using Express.js and Python, designed to handle various functionalities such as data processing and machine learning tasks. Below are the instructions to set up and run the project.
Table of Contents

    Prerequisites
    Installation
    Setting Up the Backend
    Python Integration
    Running the Project
    Testing

Prerequisites

Ensure you have the following installed:

    Node.js (v18 or higher recommended)
    Download and install from nodejs.org.

    Python (v3.7 or higher recommended)
    Download and install from python.org.

    MySQL
    Download and install from mysql.com.

Installation
1. Clone the repository

git clone <your-repository-url>
cd <your-project-folder>

2. Install Node.js Dependencies

Run the following command to install the necessary npm dependencies:

npm install

3. Install Python Dependencies

Ensure that you have a Python virtual environment for Python dependencies. You can create and activate a virtual environment using:

Next, install the required Python packages:

pip install -r requirements.txt

Create a requirements.txt file if you don't already have one:

mysql-connector-python
networkx
matplotlib
plotly
scikit-learn
pandas

Setting Up the Backend
1. Configuration

Create a .env file at the root of the project directory to set up environment variables for both your Express backend and Python scripts.

Example .env file:

MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword
MYSQL_DB=yourdatabase
PORT=3000

The .env file will store sensitive information like your MySQL credentials and server configurations.
2. MySQL Setup

Make sure you have MySQL set up and running. You can create a database by running the following command:

CREATE DATABASE yourdatabase;

Python Integration

The backend integrates with Python for tasks such as data processing and machine learning. You will run Python scripts through the Node.js backend using the child_process module.
Python Scripts

    Data Processing: The Python script processes data (e.g., importing data from MySQL, cleaning, and analyzing).
    Machine Learning: The Python script uses scikit-learn for regression models and data prediction tasks.

You may want to call the Python script through Express routes. Here’s an example of how to do so:

const { spawn } = require('child_process');
const pythonProcess = spawn('python3', ['path/to/your-python-script.py']);

pythonProcess.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

pythonProcess.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

pythonProcess.on('close', (code) => {
  console.log(`Python script finished with code ${code}`);
});

Example Python Code (e.g., your-python-script.py)

import mysql.connector
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Set up database connection
conn = mysql.connector.connect(
    host=os.getenv('MYSQL_HOST'),
    user=os.getenv('MYSQL_USER'),
    password=os.getenv('MYSQL_PASSWORD'),
    database=os.getenv('MYSQL_DB')
)

cursor = conn.cursor()
cursor.execute("SELECT * FROM your_table")
data = cursor.fetchall()

# Further processing of data
print(data)  # Example: This output will be captured by Node.js

Running the Project
1. Start the Express Server

Once the installation and setup are complete, you can start the Express backend server with the following command:

npm start

This will launch the Express server on the port specified in the .env file.
2. Running Python Scripts via Express Routes

You can create Express routes that trigger Python scripts when accessed. Example:

app.get('/run-python', (req, res) => {
  const pythonProcess = spawn('python3', ['path/to/your-python-script.py']);
  
  pythonProcess.stdout.on('data', (data) => {
    res.send(`Python script output: ${data}`);
  });
  
  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
  
  pythonProcess.on('close', (code) => {
    console.log(`Python script finished with code ${code}`);
  });
});

This example route will call the Python script when you visit /run-python.
Testing
1. Test the Backend API

For basic testing, you can use Postman or any HTTP client to test the API endpoints exposed by your Express.js server.

Run the following curl command to test the /run-python route:

curl http://localhost:3000/run-python

2. Test Python Integration

Ensure that the Python scripts are producing the expected output when called by the Node.js backend.
Additional Information

    Node.js Dependencies:
        express: Web framework for building APIs.
        mysql/mysql2: MySQL database clients for Node.js.
        dotenv: Loads environment variables.
        express-fileupload: For handling file uploads.
        multer: Another library for handling file uploads.
        json2csv, csv-parser: For handling CSV data.

    Python Dependencies:
        mysql-connector-python: MySQL database connector for Python.
        networkx, matplotlib, plotly: For graphing and visualization.
        pandas: For data manipulation.
        scikit-learn: For machine learning models.
