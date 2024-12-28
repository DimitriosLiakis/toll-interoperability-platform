const express = require('express');
const router = express.Router();
const forecast_controller = require('../controllers/forecast_controller');

router.get('/:company_id/:date', forecast_controller);

module.exports = router;