const express = require('express');
const router = express.Router();
const controller = require('../controllers/get_figures_controller');

router.get('/', controller.get_figures);

module.exports = router;