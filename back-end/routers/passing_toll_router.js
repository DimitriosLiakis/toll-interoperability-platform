const express = require('express');
const router = express.Router();
const controller = require('../controllers/passing_toll_controller');

router.put('/', controller.passing_toll);

module.exports = router;
