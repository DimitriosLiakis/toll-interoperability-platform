const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth_controller');

router.post('/login', controller.authenticate);
router.post('/logout', controller.logout);

module.exports = router;
