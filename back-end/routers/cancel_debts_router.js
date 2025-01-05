const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');
const controller = require('../controllers/cancel_debts_controller');

router.patch('/', authenticateToken, authorizeRole(['user', 'admin']), async (req, res) => {
    const user = req.user;

    try {
        // Αν ο χρήστης είναι admin, έχει πρόσβαση σε όλα τα δεδομένα
        if (user.role === 'admin') {
            return await controller.cancel_debts(req, res);
        }

        // Αν είναι χρήστης εταιρείας, φιλτράρουμε τις οφειλές που την αφορούν
        const companyID = user.company_id;
        req.body.companyID = companyID; // Προσθέτουμε το φίλτρο στο αίτημα

        return await controller.cancel_debts(req, res);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;
