const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getAllPatients,
  getPatientAppointmentHistory,
  getAllAppointments
} = require("../controllers/adminController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// All routes are admin-only
router.use(protect, authorizeRoles("admin"));

// Dashboard statistics
router.get("/dashboard-stats", getDashboardStats);

// Get all patients
router.get("/patients", getAllPatients);

// Get a patient's appointment history
router.get(
  "/patients/:patientId/appointments",
  getPatientAppointmentHistory
);
router.get("/appointments", getAllAppointments);

module.exports = router;