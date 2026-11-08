const express = require("express");
const router = express.Router();

const {
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// Patient routes
router.post(
  "/",
  protect,
  authorizeRoles("patient"),
  bookAppointment
);

router.get(
  "/patient",
  protect,
  authorizeRoles("patient"),
  getPatientAppointments
);

// Doctor routes
router.get(
  "/doctor",
  protect,
  authorizeRoles("doctor"),
  getDoctorAppointments
);

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("doctor"),
  updateAppointmentStatus
);

module.exports = router;