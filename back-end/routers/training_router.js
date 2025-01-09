const express = require('express');
const router = express.Router();
const training_controller = require('../controllers/training_controller');
const peak_training_controller = require('../controllers/peak_training_controller');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

router.post('/',authenticateToken, authorizeRole(["admin"]), async (req, res, next) => {
    try {
        // Ensure the response is only sent once
        await training_controller(req, res, next); // Ensure it calls `next()` if further processing is required
        await peak_training_controller(req, res, next);

    } catch (error) {
        console.error('[training_router] Error:', error.message);
    }
});

module.exports = router;
