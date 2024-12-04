const express = require('express');
const router = express.Router();
const controller = require('../controllers/cancel_debts_controller');

router.post('/', controller.cancel_debts);

module.exports = router;
