
const mongoose = require("mongoose");

const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Specialization = require("../models/Specialization");

// CREATE DOCTOR
const createDoctor = async (req, res) => {
  let session;

  try {
    const {
      name,
      username,
      email,
      password,
      phone,
      specialization,
      experience,
      bio,
      consultationFee,
    } = req.body;

    // Validate required fields and their types
    if (
      typeof name !== "string" ||
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof specialization !== "string" ||
      experience === undefined ||
      experience === null ||
      experience === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required doctor details.",
      });
    }

    // Normalize input
    const normalizedName = name.trim();
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    if (
      !normalizedName ||
      !normalizedUsername ||
      !normalizedEmail
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, username and email cannot be empty.",
      });
    }

    // Validate password
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // Validate experience
    const doctorExperience = Number(experience);

    if (
      !Number.isFinite(doctorExperience) ||
      doctorExperience < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Experience must be a valid non-negative number.",
      });
    }

    // Validate consultation fee
    const fee =
      consultationFee === undefined
        ? 0
        : Number(consultationFee);

    if (
      consultationFee === "" ||
      !Number.isFinite(fee) ||
      fee < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Consultation fee must be a valid non-negative number.",
      });
    }

    // Validate optional fields
    if (
      phone !== undefined &&
      typeof phone !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Phone must be a string.",
      });
    }

    if (
      bio !== undefined &&
      typeof bio !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Bio must be a string.",
      });
    }

    // Validate specialization ID
    if (!mongoose.isValidObjectId(specialization)) {
      return res.status(400).json({
        success: false,
        message: "Invalid specialization ID.",
      });
    }

    // Check duplicate email or username
    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { username: normalizedUsername },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or username already exists.",
      });
    }

    // Verify active specialization
    const specializationExists = await Specialization.findOne({
      _id: specialization,
      isActive: true,
    });

    if (!specializationExists) {
      return res.status(404).json({
        success: false,
        message: "Active specialization not found.",
      });
    }

    // Start MongoDB transaction
    session = await mongoose.startSession();

    let createdDoctor;

    await session.withTransaction(async () => {
      // Create doctor login account
      const [doctorUser] = await User.create(
        [
          {
            name: normalizedName,
            username: normalizedUsername,
            email: normalizedEmail,
            password,
            phone: phone ? phone.trim() : "",
            role: "doctor",
            isEmailVerified: true,
            isActive: true,
          },
        ],
        { session }
      );

      // Create doctor professional profile
      const [doctorProfile] = await Doctor.create(
        [
          {
            user: doctorUser._id,
            specialization,
            experience: doctorExperience,
            bio: bio ? bio.trim() : "",
            consultationFee: fee,
          },
        ],
        { session }
      );

      createdDoctor = doctorProfile;
    });

    return res.status(201).json({
      success: true,
      message: "Doctor account created successfully.",
      doctor: createdDoctor,
    });

  } catch (error) {
    console.error("Create doctor error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or username already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while creating doctor.",
    });

  } finally {
    if (session) {
      await session.endSession();
    }
  }
};


// GET ALL DOCTORS
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate({
        path: "user",
        match: {
          role: "doctor",
          isActive: true,
        },
        select: "name username email phone profileImage isActive",
      })
      .populate({
        path: "specialization",
        select: "name description isActive",
      })
      .sort({ createdAt: -1 });

    // Remove doctors whose user account is inactive or missing
    const activeDoctors = doctors.filter(
      (doctor) => doctor.user !== null
    );

    return res.status(200).json({
      success: true,
      count: activeDoctors.length,
      doctors: activeDoctors,
    });

  } catch (error) {
    console.error("Get doctors error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching doctors.",
    });
  }
};


module.exports = {
  createDoctor,
  getAllDoctors,
};
