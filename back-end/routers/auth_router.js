const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth_controller');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

router.post('/login', controller.authenticate);
router.post('/logout', controller.logout);
router.get('/whoami',  authenticateToken, controller.whoami);

module.exports = router;
