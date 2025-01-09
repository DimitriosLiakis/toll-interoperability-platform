const express = require('express');
const router = express.Router();
const peak_controller = require('../controllers/peak_controller');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

router.get('/:company_id?/:DateFrom?/:DateTo?', authenticateToken, authorizeRole(["users","admin"]), peak_controller);

router.get('*', (req, res) => {
    console.log("400 - Route not found");
    res.status(400).json({ error: "Missing required parameters." });
});

module.exports = router;