const express = require('express');
const router = express.Router();
const controller = require('../controllers/passesCost_controller'); 
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

rrouter.get('/:tollOpID/:tagOpID/:date_from/:date_to', authenticateToken, authorizeRole(['user', 'admin']), (req, res) => {
    const user = req.user;
    if (user.role === 'user' && user.company_id !== req.params.tollOpID) {
        return res.status(403).json({ error: 'Access denied' });
    }
    passesCost_controller(req, res);
});


module.exports = router;