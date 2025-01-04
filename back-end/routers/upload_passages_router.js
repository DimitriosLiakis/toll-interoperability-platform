const express = require('express');
const { uploadCsv } = require('../controllers/upload_passages_controller');
const router = express.Router();

// Route for uploading CSV files
router.use('/', uploadCsv);

module.exports = router; // Fix: Correct the export
