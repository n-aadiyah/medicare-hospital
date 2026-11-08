const express = require("express");
const router = express.Router();

const {
  addAvailability,
  getMyAvailability,
} = require("../controllers/availabilityController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.post(
  "/",
  protect,
  authorizeRoles("doctor"),
  addAvailability
);

router.get(
  "/my",
  protect,
  authorizeRoles("doctor"),
  getMyAvailability
);

module.exports = router;