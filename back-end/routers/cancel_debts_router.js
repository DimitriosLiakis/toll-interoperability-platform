const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');
const controller = require('../controllers/cancel_debts_controller');

//router.patch('/', controller.cancel_debts);
router.patch('/', authenticateToken, authorizeRole(['user', 'admin']), async (req, res) => {
    const user = req.user;

    try {
        // Αν ο χρήστης είναι admin, έχει πρόσβαση σε όλα τα δεδομένα
        if (user.role === 'admin') {
            const result = await controller.cancel_debts(req, res);
            return res.status(result ? 200 : 204).json(result || {});
        }

        // Αν είναι χρήστης εταιρείας, φιλτράρουμε τις οφειλές που την αφορούν
        const companyID = user.company_id;
        req.body.companyID = companyID; // Προσθέτουμε το φίλτρο στο αίτημα

        const result = await controller.cancel_debts(req, res);
        return res.status(result ? 200 : 204).json(result || {});
    } catch (error) {
        if (error instanceof ValidationError) {
            res.status(400).json({ error: 'Bad request', details: error.message });
        } else {
            res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    }
});

module.exports = router;
