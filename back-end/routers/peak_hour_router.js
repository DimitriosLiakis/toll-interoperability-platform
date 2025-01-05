const express = require('express');
const router = express.Router();
const peak_controller = require('../controllers/peak_controller');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

uter.get('/:company_id/:DateFrom/:DateTo', authenticateToken, authorizeRole(['user', 'admin']), (req, res) => {
    const user = req.user;
    if (user.role === 'user' && user.company_id !== req.params.company_id) {
        return res.status(403).json({ error: 'Access denied' });
    }
    peak_controller(req, res);
});

module.exports = router;