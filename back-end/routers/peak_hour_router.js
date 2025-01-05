const express = require('express');
const router = express.Router();
const peak_controller = require('../controllers/peak_controller');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

//router.get('/:company_id/:DateFrom/:DateTo', peak_controller);
router.get('/:company_id/:DateFrom/:DateTo', authenticateToken, authorizeRole(['user', 'admin']), (req, res) => {
    try {
        const user = req.user;
        if (user.role === 'user' && user.company_id !== req.params.company_id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const result = peak_controller(req, res);
        return res.status(result ? 200 : 204).json(result || {});
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;