const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);

// Multer configuration for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.resolve(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir); // Save files in 'uploads' directory
  },
  filename: (req, file, cb) => {
    const uploadPath = path.resolve(__dirname, '../uploads/passages.csv'); // Resolve path
    if (fs.existsSync(uploadPath)) {
      fs.unlinkSync(uploadPath);
    }
    cb(null, 'passages.csv');
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

exports.uploadCsv = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      // Handle Multer-specific errors or other internal server errors
      return res.status(500).json({ message: 'Internal server error: ' + err.message });
    }

    if (!req.file) {
      // Explicitly end the response to avoid hanging
      return res.status(204).end(); // Use `.end()` to explicitly indicate the response is finished
    }
    

    const format = req.query.format || 'json';

    if (format === 'csv') {
      try {
        const fileContent = await readFileAsync(csvFilePath, 'utf8');
      } catch (readError) {
        console.error('Error reading the file:', readError);
        return res.status(500).json({ message: 'Internal server error: ' + readError.message });
      }
      
    } else {
      // Return success response in JSON format
      return res.status(200).json({
        message: 'CSV file uploaded successfully!',
        file: {
          filename: 'passages.csv',
          path: req.file.path,
          size: req.file.size,
        },
      });
    }
  });
};
