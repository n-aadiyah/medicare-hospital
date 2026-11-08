
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

// Generate and send patient OTP
const sendPatientOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user = await User.findOne({ email: normalizedEmail });

    if (user && user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "This email is not registered as a patient account",
      });
    }

    if (!user) {
      user = await User.create({
        name: normalizedEmail.split("@")[0],
        email: normalizedEmail,
        role: "patient",
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    user.otpHash = otpHash;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    try {
      await sendEmail({
        to: normalizedEmail,
        subject: "MediCare - Email Verification OTP",
        text: `Your MediCare verification OTP is ${otp}. It expires in 5 minutes. Do not share this code with anyone.`,
      });
    } catch (emailError) {
      user.otpHash = undefined;
      user.otpExpiresAt = undefined;
      await user.save();

      throw emailError;
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    console.error("Send OTP error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to send OTP. Please try again later.",
    });
  }
};

// Verify patient OTP
const verifyPatientOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
      role: "patient",
    }).select("+otpHash +otpExpiresAt");

    if (!user || !user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "Please request a new OTP",
      });
    }

    if (user.otpExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    const isOTPValid = await bcrypt.compare(
      String(otp),
      user.otpHash
    );

    if (!isOTPValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.isEmailVerified = true;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;

    await user.save();

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Patient login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error.message);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};
//for doctor and admin authethentication

const doctorAdminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    // Find doctor or admin and include the hidden password
    const user = await User.findOne({
      username: username.trim().toLowerCase(),
      role: { $in: ["doctor", "admin"] },
    }).select("+password");

    // Use a generic error for invalid credentials
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    // Compare entered password with hashed password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Doctor/Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};


module.exports = {
  sendPatientOTP,
  verifyPatientOTP,
  doctorAdminLogin,
};
