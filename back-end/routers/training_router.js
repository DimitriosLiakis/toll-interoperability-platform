const express = require('express');
const router = express.Router();
const training_controller = require('../controllers/training_controller');
const peak_training_controller = require('../controllers/peak_training_controller');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

router.post('/',authenticateToken, authorizeRole(["user","admin"]), async (req, res, next) => {
    try {
        // Ensure the response is only sent once
        await training_controller(req, res, next); // Ensure it calls `next()` if further processing is required
        await peak_training_controller(req, res, next);

        // Send the final success response only once
        // return res.status(200).json({ message: 'Training completed successfully' });
    } catch (error) {
        console.error('[training_router] Error:', error.message);

        // // Ensure we don't send multiple responses
        // if (!res.headersSent) {
        //     return res.status(500).json({ error: 'Internal server error' });
        // }
    }
});
/*router.post('/', async (req, res, next) => {
    try {
        // Ensure the response is only sent once
        await training_controller(req, res, next); // Ensure it calls `next()` if further processing is required
        await peak_training_controller(req, res, next);

        // Send the final success response only once
        // return res.status(200).json({ message: 'Training completed successfully' });
    } catch (error) {
        console.error('[training_router] Error:', error.message);

        // // Ensure we don't send multiple responses
        // if (!res.headersSent) {
        //     return res.status(500).json({ error: 'Internal server error' });
        // }
    }
});*/

module.exports = router;
