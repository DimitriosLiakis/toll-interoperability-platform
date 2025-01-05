const express = require('express');
const router = express.Router();
const controller = require('../controllers/tollStationsPasses_controller');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

router.get('/:tollStationID?/:date_from?/:date_to?',authenticateToken, authorizeRole(["user","admin"]), (req, res, next) => {
    const { tollStationID, date_from, date_to } = req.params;

    if (!tollStationID || !date_from || !date_to) {
        return res.status(400).json({ error: 'Missing required parameters: tollStationID, date_from, date_to' });
    }
    next();
}, controller.getTollStationPasses);
/*router.get('/:tollStationID?/:date_from?/:date_to?', (req, res, next) => {
    const { tollStationID, date_from, date_to } = req.params;

    if (!tollStationID || !date_from || !date_to) {
        return res.status(400).json({ error: 'Missing required parameters: tollStationID, date_from, date_to' });
    }
    next();
}, controller.getTollStationPasses);*/

module.exports = router;
