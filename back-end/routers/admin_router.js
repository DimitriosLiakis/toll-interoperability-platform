const express = require("express");
const router = express.Router();
const { healthcheck } = require("../controllers/admin_controller");

// Define the healthcheck route
router.get("/healthcheck", healthcheck);

module.exports = router;