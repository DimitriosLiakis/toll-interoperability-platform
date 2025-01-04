const express = require('express');
const router = express.Router();
const controller = require('../controllers/tollStationsPasses_controller'); 
//const authMiddleware = require('../middlewares/authMiddleware'); 

//router.get('/:tollStationID/:date_from/:date_to', authMiddleware, controller.getPasses);
router.get('/:tollStationID/:date_from/:date_to', controller.getTollStationPasses);

module.exports = router;