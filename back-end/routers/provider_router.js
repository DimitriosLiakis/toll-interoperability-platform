const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');

// POST route to get the provider by transceiver ID or driver name
router.post('/', providerController.getProvider);

module.exports = router;
