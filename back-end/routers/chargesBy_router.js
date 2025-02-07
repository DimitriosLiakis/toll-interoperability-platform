const express = require('express');
const router = express.Router();
const chargesBy_controller = require('../controllers/chargesBy_controller'); 
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

router.get('/:tollOpID?/:date_from?/:date_to?', chargesBy_controller);

router.get('*', (req, res) => {
    console.log("400 - Route not found");
    res.status(400).json({ error: "Missing required parameters." });
});


module.exports = router;