# TollAnalysis
---

## Prerequisites

Ensure that you have the following installed on your system:

- Node.js (v18 or higher recommended)
- npm (Node Package Manager)

---

## Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd back-end
   ```

2. Install the required dependencies:

   ```bash
   npm install
   ```

3. Start the backend server:

   ```bash
   npm start
   ```

   The backend will start running, and the server will listen on the configured port (default is `5000`).

---

## Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd front-end
   ```

2. Install the required dependencies:

   ```bash
   npm install
   ```

3. Start the frontend development server:

   ```bash
   npm start
   ```

   The frontend development server will start, typically on `http://localhost:3000`. It will automatically open in your default browser.

---

## Notes

- Ensure the backend is running before interacting with the frontend to avoid connection issues.
- If you encounter any issues, check the terminal logs for error messages and resolve them as needed.

---

## Troubleshooting

1. **Port Already in Use:**
   If you encounter an error like `EADDRINUSE` while starting the backend or frontend, it means the port is already in use. Use the following command to find and kill the process occupying the port:

   ```bash
   lsof -i :<PORT>
   kill -9 <PID>
   ```

2. **Dependencies Not Installed:**
   If you encounter missing module errors, ensure you have run `npm install` in the respective directories.

3. **Contact Information:**
   If you need further assistance, please reach out to the project maintainers.

---
