const express = require('express');
const router = express.Router();
const forecast_controller = require('../controllers/forecast_controller');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

outer.get('/:company_id/:date', authenticateToken, authorizeRole(['user', 'admin']), (req, res) => {
    const user = req.user;
    if (user.role === 'user' && user.company_id !== req.params.company_id) {
        return res.status(403).json({ error: 'Access denied' });
    }
    forecast_controller(req, res);
});

module.exports = router;