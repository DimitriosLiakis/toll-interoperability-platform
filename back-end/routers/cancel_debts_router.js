const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');
const controller = require('../controllers/cancel_debts_controller');

router.patch('/',authenticateToken, authorizeRole(["admin"]), controller.cancel_debts);
//router.patch('/', controller.cancel_debts);

module.exports = router;
