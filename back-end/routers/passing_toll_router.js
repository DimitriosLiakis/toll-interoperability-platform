const express = require('express');
const router = express.Router();
const controller = require('../controllers/passing_toll_controller');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

router.put('/', authenticateToken, authorizeRole(['user', 'admin']), (req, res) => {
    const user = req.user;
    if (user.role === 'user' && !user.allowedTolls.includes(req.body.tollID)) {
        return res.status(403).json({ error: 'Access denied' });
    }
    controller.passing_toll(req, res);
});

module.exports = router;
