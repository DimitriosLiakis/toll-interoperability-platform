const express = require('express');
const router = express.Router();
const controller = require('../controllers/passing_toll_controller');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

router.put('/',authenticateToken, authorizeRole(["users","admin"]), controller.passing_toll);
//router.put('/', controller.passing_toll);
module.exports = router;
