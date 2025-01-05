const express = require('express');
const router = express.Router();
const controller = require('../controllers/passesCost_controller'); 
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

router.get('/:tollOpID/:tagOpID/:date_from/:date_to',authenticateToken, authorizeRole(["user","admin"]), controller.passesCost_controller);
//router.get('/:tollOpID/:tagOpID/:date_from/:date_to', controller.passesCost_controller);

module.exports = router;