const express = require('express');
const { uploadCsv } = require('../controllers/upload_passages_controller');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

//router.post('/', uploadCsv);
// Route for uploading CSV files
router.post('/', authenticateToken, authorizeRole(['admin']), (req, res) => {
    try {
        const result = uploadCsv(req, res);
        return res.status(result ? 200 : 204).json(result || {});
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router; 
