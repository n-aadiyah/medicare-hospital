const express = require("express");
const router = express.Router();

const {
  createPrescription,
  getPatientPrescriptions,
} = require("../controllers/prescriptionController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// Doctor adds a prescription
router.post(
  "/",
  protect,
  authorizeRoles("doctor"),
  createPrescription
);

// Patient views prescriptions
router.get(
  "/patient",
  protect,
  authorizeRoles("patient"),
  getPatientPrescriptions
);

module.exports = router;