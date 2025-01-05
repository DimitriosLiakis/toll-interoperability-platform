const express = require('express');
const router = express.Router();
const controller = require('../controllers/tollStationsPasses_controller');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

router.get('/:tollStationID?/:date_from?/:date_to?', authenticateToken, authorizeRole(['user', 'admin']), (req, res) => {
    try {
        const { tollStationID, date_from, date_to } = req.params;
        const user = req.user;
        if (user.role === 'user' && !user.allowedStations.includes(tollStationID)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const result = controller.getTollStationPass(req, res);
        return res.status(result ? 200 : 204).json(result || {});
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;
