const express = require('express');
const router = express.Router();
const controller = require('../controllers/get_figures_controller');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

router.get('/',authenticateToken, authorizeRole(["users","admin"]), controller.get_figures);
//router.get('/', controller.get_figures);
module.exports = router;