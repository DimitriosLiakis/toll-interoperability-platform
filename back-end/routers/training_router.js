const express = require('express')
const router = express.Router()
const training_controller = require('../controllers/training_controller')

router.post('/', training_controller);

module.exports = router;