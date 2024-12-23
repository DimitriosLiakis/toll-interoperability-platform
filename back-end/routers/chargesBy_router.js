const express = require('express');
const router = express.Router();
const chargesBy_controller = require('../controllers/chargesBy_controller'); 


router.get('/:tollOpID/:date_from/:date_to', chargesBy_controller);

module.exports = router;