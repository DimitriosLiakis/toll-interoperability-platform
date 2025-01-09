const express = require('express');
const { uploadCsv } = require('../controllers/upload_passages_controller');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

router.post('/',authenticateToken, authorizeRole(["users","admin"]), uploadCsv);
//router.post('/', uploadCsv);
module.exports = router; 
