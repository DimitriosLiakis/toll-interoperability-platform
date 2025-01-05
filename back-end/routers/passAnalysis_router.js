const express = require('express');
const router = express.Router();
const passAnalysis_controller = require('../controllers/passAnalysis_controller');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

router.get('/:stationOpID/:tagOpID/:date_from/:date_to',authenticateToken, authorizeRole(["user","admin"]), passAnalysis_controller);
//router.get('/:stationOpID/:tagOpID/:date_from/:date_to', passAnalysis_controller);

module.exports = router;