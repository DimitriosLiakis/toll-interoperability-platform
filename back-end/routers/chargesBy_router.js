const express = require('express');
const router = express.Router();
const chargesBy_controller = require('../controllers/chargesBy_controller'); 
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

router.get('/:tollOpID/:date_from/:date_to',authenticateToken, authorizeRole(["user","admin"]), chargesBy_controller);
//router.get('/:tollOpID/:date_from/:date_to', chargesBy_controller);

module.exports = router;