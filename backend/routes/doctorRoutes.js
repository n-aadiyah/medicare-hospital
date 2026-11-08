
const express = require("express");
const router = express.Router();

const { createDoctor ,getAllDoctors,getDoctorById,updateDoctor,deactivateDoctor,updateMyDoctorProfile,getMyDoctorProfile} = require("../controllers/doctorController");
const { getPublicDoctors } = require("../controllers/doctorController");
const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");
// Public: patients can browse active doctors
router.get("/public", getPublicDoctors);
// Admin-only: create doctor account and profile
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createDoctor
);
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getAllDoctors
);
router.get(
  "/profile/me",
  protect,
  authorizeRoles("doctor"),
  getMyDoctorProfile
);
// Doctor updates own profile
router.put(
  "/profile/me",
  protect,
  authorizeRoles("doctor"),
  updateMyDoctorProfile
);
// Admin-only: get doctor by ID
router.get(
  "/:id",
  protect,
  authorizeRoles("admin"),
  getDoctorById
);
// Admin-only: update doctor details
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateDoctor
);
// Admin-only: deactivate doctor
router.patch(
  "/:id/deactivate",
  protect,
  authorizeRoles("admin"),
  deactivateDoctor
);

module.exports = router;
