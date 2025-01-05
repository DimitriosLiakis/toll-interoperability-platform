const express = require('express');
const router = express.Router();
const chargesBy_controller = require('../controllers/chargesBy_controller'); 
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

//router.get('/:tollOpID/:date_from/:date_to', chargesBy_controller);
router.get('/:tollOpID/:date_from/:date_to', authenticateToken, authorizeRole(['user', 'admin']), (req, res) => {
    try {
        const user = req.user;
        if (user.role === 'user' && user.company_id !== req.params.tollOpID) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const result = chargesBy_controller(req, res);
        return res.status(result ? 200 : 204).json(result || {});
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
})

module.exports = router;