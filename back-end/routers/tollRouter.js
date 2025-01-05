// back-end/routers/tollRouter.js
const express = require('express');
const router = express.Router();
const tollController = require('../controllers/tollController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');


router.get('/tolls', tollController.getTolls);
//router.get('/tolls',authenticateToken, authorizeRole(["user","admin"]), tollController.getTolls);
module.exports = router;
