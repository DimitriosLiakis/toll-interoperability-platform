const express = require('express');
const router = express.Router();
const chargesBy_controller = require('../controllers/chargesBy_controller'); 
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');


router.get('/:tollOpID/:date_from/:date_to', authenticateToken, authorizeRole(['user', 'admin']), (req, res) => {
    const user = req.user;
    if (user.role === 'user' && user.company_id !== req.params.tollOpID) {
        return res.status(403).json({ error: 'Access denied' });
    }
    chargesBy_controller(req, res);
});

module.exports = router;