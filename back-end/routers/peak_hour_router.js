const express = require('express');
const router = express.Router();
const peak_controller = require('../controllers/peak_controller');

router.get('/:company_id/:DateFrom/:DateTo', peak_controller);

module.exports = router;