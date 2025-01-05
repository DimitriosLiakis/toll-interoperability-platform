const express = require('express');
const router = express.Router();
const controller = require('../controllers/passing_toll_controller');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

//router.put('/', controller.passing_toll);
router.put('/', authenticateToken, authorizeRole(['user', 'admin']), (req, res) => {
    try {
        const user = req.user;
        if (user.role === 'user' && !user.allowedTolls.includes(req.body.tollID)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const result = controller.passing_toll(req, res);
        return res.status(result ? 200 : 204).json(result || {});
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;
