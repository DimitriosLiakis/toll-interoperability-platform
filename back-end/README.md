Back-End

This project includes the back-end of the application, which is built with Node.js and Express to manage APIs and connect to a database.
Contents

    Node.js/Express Backend for API and request handling
    MySQL and MySQL2 for database connection
    CSV data formatting using libraries like csv-parser and json2csv
    File uploads with express-fileupload and multer
    Environment configuration with dotenv
    Data validation with express-validator

Requirements

To run the application, make sure you have the following installed:

    Node.js (at least v16.0.0)
    npm or yarn for dependency management

Installation

    Clone the repository:

    git clone https://github.com/username/repository-name.git

    Navigate to the project folder:

    cd repository-name

    Install the dependencies:

    npm install

Environment Configuration

Create a .env file in the root directory of the application and add the required environment variables, for example:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=database_name
PORT=5000

Starting the Server

To start the server, use the following command, which runs the server.js file:

npm start

This will start the Express server and make it available on the specified port (e.g., localhost:5000).

For running the app in development mode with automatic code refresh when you make changes, use:

npm run dev
Scripts

    To run the app in development mode (using nodemon for auto-reloading):

    npm run dev

    To run the app in production mode:

    npm start

Tests

No tests are currently available for this project. When added, they can be run with the command:

npm test
Notes

    This project uses the following libraries:
        cors: For enabling CORS (Cross-Origin Resource Sharing).
        express: For setting up the back-end server.
        mysql and mysql2: For connecting to the MySQL database.
        multer: For handling file uploads and storage.
        express-validator: For data validation.
        dotenv: For managing environment variables.
        date-fns: For working with dates.
        csv-parser and json2csv: For working with CSV files
