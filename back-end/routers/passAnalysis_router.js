const express = require('express');
const router = express.Router();
const passAnalysis_controller = require('../controllers/passAnalysis_controller');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

router.get('/:stationOpID/:tagOpID/:date_from/:date_to', authenticateToken, authorizeRole(['user', 'admin']), (req, res) => {
    const user = req.user;
    if (user.role === 'user' && user.company_id !== req.params.stationOpID) {
        return res.status(403).json({ error: 'Access denied' });
    }
    passAnalysis_controller(req, res);
});

module.exports = router;