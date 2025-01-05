// back-end/routers/tollRouter.js
const express = require('express');
const router = express.Router();
const tollController = require('../controllers/tollController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

// Define the route to fetch toll data
router.get('/tolls', authenticateToken, authorizeRole(['user', 'admin']), (req, res) => {
    tollController.getTolls(req, res);
});

module.exports = router;
