const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer configuration for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.resolve(__dirname, '../uploads'); // Fix: Ensure path is correct
    cb(null, uploadDir); // Save files in 'uploads' directory
  },
  filename: (req, file, cb) => {
    const uploadPath = path.resolve(__dirname, '../uploads/passages.csv'); // Fix: Resolve path
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

// Controller function for file upload
exports.uploadCsv = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    res.status(200).json({
      message: 'CSV file uploaded successfully!',
      file: {
        filename: 'passages.csv',
        path: req.file.path,
        size: req.file.size,
      },
    });
  });
};
