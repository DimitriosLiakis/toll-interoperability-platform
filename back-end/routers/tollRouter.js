// back-end/routers/tollRouter.js
const express = require('express');
const router = express.Router();
const tollController = require('../controllers/tollController');

// Define the route to fetch toll data
router.get('/tolls', tollController.getTolls);

module.exports = router;
