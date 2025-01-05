const express = require('express');
const router = express.Router();
const controller = require('../controllers/get_figures_controller');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

//here a exists a demonstration of the use of the middleware authenticateToken and authorizeRole
//router.get('/',authenticateToken, authorizeRole(["user","admin"]), controller.get_figures);
router.get('/', authenticateToken, authorizeRole(['user', 'admin']), async (req, res) => {
    try {
        const result = await controller.get_figures(req, res);
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