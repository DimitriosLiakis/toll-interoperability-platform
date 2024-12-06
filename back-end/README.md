Back-End Application

This is a back-end application built using Node.js and Express for managing routes, executing Python scripts, and interacting with a MySQL database.
Table of Contents

    Requirements
    Installation
    Setup
    Usage
    Project Structure
    Scripts
    Dependencies

Requirements

Before you begin, ensure you have the following installed:

    Node.js (v14 or higher)
    npm (comes with Node.js)
    MySQL
    Python 3.x with the necessary modules (e.g., mysql-connector, networkx, matplotlib)

Installation

Clone the repository and navigate to its root directory:

git clone <repository-url>
cd back-end

Install dependencies:

npm install

Setup

    Environment Variables:
    Create a .env file in the root directory and define the following environment variables:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=2002
DB_NAME=draft_b

Database:
Ensure your MySQL database is running, and the schema is set up according to the application's requirements. Import the required database schema into MySQL.

Python Setup:
Ensure the Python script dependencies are installed. Run the following command in the directory containing the cancelling_algo.py script:

    pip install mysql-connector-python networkx matplotlib

Usage

    Run the Development Server:
    Use nodemon for development:

npm start

Alternatively, run without nodemon:

    node index.js

    Access the Server:
    The application will start on http://localhost:5000.

    Endpoints:
        POST /api/passing_toll: Handle toll-related operations.
        POST /api/upload_passages: Upload passage details.
        PATCH /api/cancel_debts: Run the debt cancellation Python script and return results.
        GET /api/get_debts_optimization: Retrieve debt optimization figures.

Project Structure

back-end/
├── controllers/
│   ├── cancel_debts_controller.js
│   ├── passing_toll_controller.js
│   ├── ...
├── routers/
│   ├── cancel_debts_router.js
│   ├── passing_toll_router.js
│   ├── ...
├── scripts/
│   ├── cancelling_algo.py
├── debt_figures/    # Contains generated PNG files from Python scripts
├── index.js         # Entry point of the app
├── app.js           # App configuration and middleware
├── package.json
├── .env             # Environment variables
└── README.md

Scripts

The following npm scripts are defined in package.json:

    npm test: Placeholder for running tests.
    npm start: Start the application using nodemon.

Dependencies
Main Dependencies:

    express: Web framework for Node.js.
    cors: Middleware for enabling CORS.
    dotenv: Manage environment variables.
    mysql: MySQL integration for Node.js.
    mysql2: Improved MySQL client for Node.js.
    multer: File upload middleware.

Dev Dependencies:

    nodemon: Automatically restart the server during development.