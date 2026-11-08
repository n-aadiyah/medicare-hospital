const express = require("express");
const router = express.Router();

const {
  addAvailability,
  getMyAvailability,
  getDoctorAvailability,
} = require("../controllers/availabilityController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// PUBLIC: Patients can view a doctor's available dates
router.get("/doctor/:doctorId", getDoctorAvailability);

// DOCTOR: Add available dates
router.post(
  "/",
  protect,
  authorizeRoles("doctor"),
  addAvailability
);

// DOCTOR: View own available dates
router.get(
  "/my",
  protect,
  authorizeRoles("doctor"),
  getMyAvailability
);

module.exports = router;