
const express = require("express");
const router = express.Router();

const {
  sendPatientOTP,
  verifyPatientOTP,
  doctorAdminLogin,
} = require("../controllers/authController");

router.post("/patient/send-otp", sendPatientOTP);
router.post("/patient/verify-otp", verifyPatientOTP);
router.post("/login", doctorAdminLogin);
module.exports = router;
