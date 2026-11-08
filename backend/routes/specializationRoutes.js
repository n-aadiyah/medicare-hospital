
const express = require("express");
const router = express.Router();

const {
  createSpecialization,
  getAllSpecializations,
  updateSpecialization,
  deactivateSpecialization,
} = require("../controllers/specializationController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// Admin-only routes
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createSpecialization
);

router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getAllSpecializations
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateSpecialization
);

router.patch(
  "/:id/deactivate",
  protect,
  authorizeRoles("admin"),
  deactivateSpecialization
);

module.exports = router;
