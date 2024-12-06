const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile); // Promisify fs.readFile for async/await

// Multer configuration for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.resolve(__dirname, '../uploads'); // Ensure path is correct
    // Create upload directory if it does not exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir); // Save files in 'uploads' directory
  },
  filename: (req, file, cb) => {
    const uploadPath = path.resolve(__dirname, '../uploads/passages.csv'); // Resolve path
    if (fs.existsSync(uploadPath)) {
      fs.unlinkSync(uploadPath); // Remove existing passages.csv if it exists
    }
    cb(null, 'passages.csv'); // Always save as passages.csv
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max size: 5 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /csv/; // Only allow CSV files
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype === 'text/csv';

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed.'));
    }
  },
}).single('file');

// Controller function for file upload and CSV response
exports.uploadCsv = async (req, res) => {
  try {
    // First, attempt to upload the file
    upload(req, res, async (err) => {
      if (err) {
        // If there's an error during file upload
        return res.status(400).json({ message: err.message });
      }

      // Check if no file was uploaded
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
      }

      // Check if the format query parameter exists (defaults to 'json')
      const format = req.query.format || 'json';

      if (format === 'csv') {
        // If the requested format is CSV, read the file and send as CSV content
        try {
          const csvFilePath = req.file.path;

          // Read the CSV file asynchronously
          const fileContent = await readFileAsync(csvFilePath, 'utf8');

          // Set response headers for CSV
          res.setHeader('Content-Type', 'text/csv');
          res.attachment('passages.csv');
          return res.send(fileContent); // Send CSV content

        } catch (readError) {
          return res.status(500).json({ message: 'Error reading the file: ' + readError.message });
        }
      } else {
        // Default to JSON response
        res.status(200).json({
          message: 'CSV file uploaded successfully!',
          file: {
            filename: 'passages.csv',
            path: req.file.path,
            size: req.file.size,
          },
        });
      }
    });
  } catch (error) {
    // Catch any unexpected errors
    console.error('Unexpected error:', error.message);
    res.status(500).json({ message: 'An unexpected error occurred.' });
  }
};
