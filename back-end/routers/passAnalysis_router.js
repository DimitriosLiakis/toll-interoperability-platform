const express = require('express');
const router = express.Router();
const passAnalysis_controller = require('../controllers/passAnalysis_controller')

router.get('/:stationOpID?/:tagOpID?/:date_from?/:date_to?', passAnalysis_controller);

router.get('*', (req, res) => {
    console.log("400 - Route not found");
    res.status(400).json({ error: "Missing required parameters." });
});


module.exports = router;