const express = require("express");
const multer = require("multer");
const router = express.Router();
const { healthcheck } = require("back-end/controllers/admin_controller");
const verifyAdmin = require("back-end/middlewares/verifyAdmin");
const upload = multer({ dest: "back-end/uploads/" });

// Define the healthcheck route
router.get("/healthcheck",verifyAdmin, adminController.healthcheck);

// Reset stations route
router.post("/resetstations", verifyAdmin, adminController.resetStations);

// Reset passes route
router.post("/resetpasses", verifyAdmin, adminController.resetPasses);
router.post("/addpasses", verifyAdmin, upload.single("passages.csv"), adminController.addPasses);
module.exports = router;