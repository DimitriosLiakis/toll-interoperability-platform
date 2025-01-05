const express = require('express');
const router = express.Router();
const controller = require('../controllers/get_figures_controller');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

//here a exists a demonstration of the use of the middleware authenticateToken and authorizeRole
router.get('/',authenticateToken, authorizeRole(["user","admin"]), controller.get_figures);

module.exports = router;