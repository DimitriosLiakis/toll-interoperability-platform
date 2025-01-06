const express = require("express");
const multer = require("multer");
const router = express.Router();
const { healthcheck } = require("back-end/controllers/admin_controller");
const verifyAdmin = require("back-end/middlewares/verifyAdmin");
const upload = multer({ dest: "back-end/uploads/" });
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

// Define the healthcheck route
router.get("/healthcheck",authenticateToken, authorizeRole(["admin"]),verifyAdmin, adminController.healthcheck);

// Reset stations route
router.post("/resetstations",authenticateToken, authorizeRole(["admin"]), verifyAdmin, adminController.resetStations);

// Reset passes route
router.post("/resetpasses",authenticateToken, authorizeRole(["admin"]), verifyAdmin, adminController.resetPasses);
router.post("/addpasses",authenticateToken, authorizeRole(["admin"]), verifyAdmin, upload.single("passages.csv"), adminController.addPasses);
module.exports = router;