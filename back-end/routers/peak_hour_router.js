const express = require('express');
const router = express.Router();
const peak_controller = require('../controllers/peak_controller');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

router.get('/:company_id/:DateFrom/:DateTo',authenticateToken, authorizeRole(["user","admin"]), peak_controller);
//router.get('/:company_id/:DateFrom/:DateTo', peak_controller);
module.exports = router;