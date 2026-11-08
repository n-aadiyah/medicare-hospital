
const express = require("express");
const router = express.Router();

const { createDoctor ,getAllDoctors,} = require("../controllers/doctorController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

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

module.exports = router;
