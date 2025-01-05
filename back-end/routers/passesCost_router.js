const express = require('express');
const router = express.Router();
const controller = require('../controllers/passesCost_controller');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');


// Adding more flexible route to catch missing parameters
router.get('/:tollOpID?/:tagOpID?/:date_from?/:date_to?',authenticateToken, authorizeRole(["user","admin"]), controller.passesCost_controller);

// Catch-all route for when parameters are missing or malformed
router.get('*', (req, res) => {
    console.log("400 - Route not found");
    res.status(400).json({ error: "Missing required parameters." });
});

module.exports = router;
