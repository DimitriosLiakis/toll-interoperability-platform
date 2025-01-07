const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin_controller");
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

// Define the healthcheck route
router.get("/healthcheck",authenticateToken, authorizeRole(["admin"]), adminController.healthcheck);

// Reset stations route
router.post("/resetstations",authenticateToken, authorizeRole(["admin"]), adminController.resetStations);

// Reset passes route
router.post("/resetpasses",authenticateToken, authorizeRole(["admin"]), adminController.resetPasses);

router.post(
    "/addpasses",
    authenticateToken,
    authorizeRole(["admin"]),
    adminController.addPasses
);
module.exports = router;