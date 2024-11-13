# CLI client

Base of the CLI README.md , will be updated in accordance to our requirements.
## Table of Contents
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Commands](#commands)
- [Usage Examples](#usage-examples)
- [Testing](#testing)

## Features
- Perform CRUD operations via REST API endpoints
- Cleanly formatted table output for data
- Secure environment variable handling
- Command validation and error handling
- Modular code structure

## Requirements
- **Node.js** (version 12 or higher)
- **npm** (Node Package Manager)

## Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/my-cli-project.git
    cd my-cli-project
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Link the CLI** (for local development):
    ```bash
    npm link
    ```

## Environment Configuration
To configure the CLI, create a `.env` file in the project root with your API details:

```plaintext
API_BASE_URL=https://api.example.com
API_KEY=your-api-key
```

- `API_BASE_URL`: The base URL of your REST API.
- `API_KEY`: Your API authentication key, if required by the server.

## Commands

### 1. **Get Data**: `my-cli get <endpoint>`
   - Fetches and displays data from the specified API endpoint.
   - **Example**: `my-cli get users`
   - **Usage**: Fetches all user data and displays it in a table format.

### 2. **Create Data**: `my-cli post <endpoint> <data>`
   - Sends a POST request with data to the specified endpoint.
   - **Example**: `my-cli post users '{"name": "Alice", "email": "alice@example.com"}'`
   - **Usage**: Creates a new user with the given data (name and email).

### 3. **Update Data**: `my-cli update <endpoint> <id> <data>`
   - Sends a PUT request to update data at a specific endpoint by ID.
   - **Example**: `my-cli update users 123 '{"email": "alice_updated@example.com"}'`
   - **Usage**: Updates the email of the user with ID `123`.

### 4. **Delete Data**: `my-cli delete <endpoint> <id>`
   - Sends a DELETE request to remove data by ID from a specific endpoint.
   - **Example**: `my-cli delete users 123`
   - **Usage**: Deletes the user with ID `123` from the users endpoint.

## Usage Examples

### Fetching Data
To retrieve data from an endpoint (e.g., users):
```bash
my-cli get users
```
This command fetches all users and displays them in a tabular format.

### Creating Data
To create a new record in the API (e.g., a new user):
```bash
my-cli post users '{"name": "Alice", "email": "alice@example.com"}'
```
This command creates a new user with the provided name and email.

### Updating Data
To update an existing record (e.g., updating a user’s email):
```bash
my-cli update users 123 '{"email": "alice_updated@example.com"}'
```
This command updates the email for the user with ID `123`.

### Deleting Data
To delete a specific record by ID (e.g., deleting a user):
```bash
my-cli delete users 123
```
This command removes the user with ID `123` from the database.

## Testing

To run tests for the CLI, use the following command:
```bash
npx mocha test/cli.test.js
```
This command runs all tests defined in the `test/cli.test.js` file to ensure that the CLI commands work as expected.
