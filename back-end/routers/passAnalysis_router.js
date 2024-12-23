const express = require('express');
const router = express.Router();
const passAnalysis_controller = require('../controllers/passAnalysis_controller')

router.get('/:stationOpID/:tollOpID/:date_from/:date_to', passAnalysis_controller);

module.exports = router;