const express = require('express');
const router = express.Router();
const controller = require('../controllers/passesCost_controller'); 


router.get('/:tollOpID/:tagOpID/:date_from/:date_to', controller.passesCost_controller);

module.exports = router;