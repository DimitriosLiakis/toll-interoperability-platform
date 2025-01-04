const express = require('express');
const { uploadCsv } = require('../controllers/upload_passages_controller');
const router = express.Router();

// Route for uploading CSV files
router.post('/', uploadCsv);

module.exports = router; 
