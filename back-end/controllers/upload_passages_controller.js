const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");

const readFileAsync = promisify(fs.readFile);

// Multer configuration for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.resolve(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir); // Save files in 'uploads' directory
  },
  filename: (req, file, cb) => {
    const uploadPath = path.resolve(__dirname, "../uploads/passages.csv"); // Resolve path
    if (fs.existsSync(uploadPath)) {
      fs.unlinkSync(uploadPath);
    }
    cb(null, "passages.csv");
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max size: 10 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /csv/; // Only allow CSV files
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype === "text/csv";

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed."));
    }
  },
}).single("file");

exports.uploadCsv = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: "Internal server error: " + err.message });
    }

    if (!req.file) {
      console.warn("No file uploaded.");
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("CSV file uploaded successfully:", req.file.path);

    // Optional: Read file content if needed
    const csvFilePath = path.resolve(__dirname, "../uploads/passages.csv");
    const format = req.query.format || "json";

    if (format === "csv") {
      try {
        const fileContent = await readFileAsync(csvFilePath, "utf8");
        console.log("CSV File Content Read Successfully");
      } catch (readError) {
        console.error("Error reading the file:", readError);
        return res.status(500).json({ message: "Error reading file: " + readError.message });
      }
    }

    next(); // Move to the next middleware (e.g., addPasses)
  });
};
