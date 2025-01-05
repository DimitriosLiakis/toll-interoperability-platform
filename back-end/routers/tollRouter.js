// back-end/routers/tollRouter.js
const express = require('express');
const router = express.Router();
const tollController = require('../controllers/tollController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

// Define the route to fetch toll data
router.get('/tolls', authenticateToken, authorizeRole(['user', 'admin']), (req, res) => {
    try {
        const result = tollController.getTolls(req, res);
        return res.status(result ? 200 : 204).json(result || {});
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;
