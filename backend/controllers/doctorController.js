const mongoose = require("mongoose");

const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Specialization = require("../models/Specialization");

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const sendError = (res, status, message) =>
  res.status(status).json({ success: false, message });

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
    } = req.body || {};

    // Required fields
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
      return sendError(
        res,
        400,
        "Please provide all required doctor details."
      );
    }

    const normalizedName = name.trim();
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || !normalizedUsername || !normalizedEmail) {
      return sendError(
        res,
        400,
        "Name, username and email cannot be empty."
      );
    }

    if (password.length < 8) {
      return sendError(
        res,
        400,
        "Password must contain at least 8 characters."
      );
    }

    if (!isValidEmail(normalizedEmail)) {
      return sendError(res, 400, "Please provide a valid email address.");
    }

    const doctorExperience = Number(experience);

    if (!Number.isFinite(doctorExperience) || doctorExperience < 0) {
      return sendError(
        res,
        400,
        "Experience must be a valid non-negative number."
      );
    }

    const fee =
      consultationFee === undefined || consultationFee === null
        ? 0
        : Number(consultationFee);

    if (
      consultationFee === "" ||
      !Number.isFinite(fee) ||
      fee < 0
    ) {
      return sendError(
        res,
        400,
        "Consultation fee must be a valid non-negative number."
      );
    }

    if (phone !== undefined && typeof phone !== "string") {
      return sendError(res, 400, "Phone must be a string.");
    }

    if (bio !== undefined && typeof bio !== "string") {
      return sendError(res, 400, "Bio must be a string.");
    }

    if (!mongoose.isValidObjectId(specialization)) {
      return sendError(res, 400, "Invalid specialization ID.");
    }

    const specializationExists = await Specialization.findOne({
      _id: specialization,
      isActive: true,
    });

    if (!specializationExists) {
      return sendError(res, 404, "Active specialization not found.");
    }

    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { username: normalizedUsername },
      ],
    });

    if (existingUser) {
      return sendError(res, 409, "Email or username already exists.");
    }

    // Create the login account and doctor profile together.
    session = await mongoose.startSession();

    let createdDoctor;

    await session.withTransaction(async () => {
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
      return sendError(res, 409, "Email or username already exists.");
    }

    return sendError(res, 500, "Server error while creating doctor.");
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

// GET ALL DOCTORS (ADMIN)
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate({
        path: "user",
        match: { role: "doctor", isActive: true },
        select: "name username email phone profileImage isActive",
      })
      .populate({
        path: "specialization",
        select: "name description isActive",
      })
      .sort({ createdAt: -1 });

    const activeDoctors = doctors.filter((doctor) => doctor.user);

    return res.status(200).json({
      success: true,
      count: activeDoctors.length,
      doctors: activeDoctors,
    });
  } catch (error) {
    console.error("Get doctors error:", error);
    return sendError(res, 500, "Server error while fetching doctors.");
  }
};

// GET PUBLIC DOCTORS (PATIENT BROWSING)
const getPublicDoctors = async (req, res) => {
  try {
    const filter = { isAvailable: true };

    // Optional specialization filter:
    // GET /api/doctors/public?specialization=<specializationId>
    if (req.query.specialization) {
      if (!mongoose.isValidObjectId(req.query.specialization)) {
        return sendError(res, 400, "Invalid specialization ID.");
      }

      filter.specialization = req.query.specialization;
    }

    const doctors = await Doctor.find(filter)
      .populate({
        path: "user",
        match: { role: "doctor", isActive: true },
        select: "name profileImage",
      })
      .populate({
        path: "specialization",
        match: { isActive: true },
        select: "name description",
      })
      .sort({ createdAt: -1 });

    const activeDoctors = doctors.filter(
      (doctor) => doctor.user && doctor.specialization
    );

    return res.status(200).json({
      success: true,
      count: activeDoctors.length,
      doctors: activeDoctors,
    });
  } catch (error) {
    console.error("Get public doctors error:", error);
    return sendError(res, 500, "Server error while fetching doctors.");
  }
};

// GET DOCTOR BY ID (ADMIN)
const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return sendError(res, 400, "Invalid doctor ID.");
    }

    const doctor = await Doctor.findById(id)
      .populate({
        path: "user",
        match: { role: "doctor", isActive: true },
        select: "name username email phone profileImage isActive",
      })
      .populate({
        path: "specialization",
        select: "name description isActive",
      });

    if (!doctor || !doctor.user) {
      return sendError(
        res,
        404,
        "Doctor not found or account is inactive."
      );
    }

    return res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.error("Get doctor by ID error:", error);
    return sendError(res, 500, "Server error while fetching doctor.");
  }
};
// GET LOGGED-IN DOCTOR'S OWN PROFILE
const getMyDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      user: req.user._id
    })
      .populate("user", "name email phone profileImage")
      .populate("specialization", "name");

    if (!doctor || !doctor.user) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found."
      });
    }

    return res.status(200).json({
      success: true,
      profile: {
        name: doctor.user.name || "",
        email: doctor.user.email || "",
        phone: doctor.user.phone || "",
        profileImage: doctor.user.profileImage || "",
        bio: doctor.bio || "",
        specialization: doctor.specialization?.name || "",
        experience: doctor.experience,
        consultationFee: doctor.consultationFee
      }
    });
  } catch (error) {
    console.error("Get own doctor profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor profile."
    });
  }
};
// UPDATE DOCTOR (ADMIN)
const updateDoctor = async (req, res) => {
  let session;

  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return sendError(res, 400, "Invalid doctor ID.");
    }

    const {
      name,
      username,
      email,
      phone,
      specialization,
      experience,
      bio,
      consultationFee,
    } = req.body || {};

    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return sendError(res, 404, "Doctor not found.");
    }

    const user = await User.findOne({
      _id: doctor.user,
      role: "doctor",
    });

    if (!user) {
      return sendError(res, 404, "Doctor account not found.");
    }

    // Validate and prepare User fields.
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return sendError(res, 400, "Name must be a non-empty string.");
      }

      user.name = name.trim();
    }

    if (username !== undefined) {
      if (typeof username !== "string" || !username.trim()) {
        return sendError(res, 400, "Username must be a non-empty string.");
      }

      user.username = username.trim().toLowerCase();
    }

    if (email !== undefined) {
      if (typeof email !== "string" || !email.trim()) {
        return sendError(res, 400, "Email must be a non-empty string.");
      }

      const normalizedEmail = email.trim().toLowerCase();

      if (!isValidEmail(normalizedEmail)) {
        return sendError(res, 400, "Please provide a valid email address.");
      }

      user.email = normalizedEmail;
    }

    if (phone !== undefined) {
      if (typeof phone !== "string") {
        return sendError(res, 400, "Phone must be a string.");
      }

      user.phone = phone.trim();
    }

    // Validate and prepare Doctor fields.
    if (specialization !== undefined) {
      if (
        typeof specialization !== "string" ||
        !mongoose.isValidObjectId(specialization)
      ) {
        return sendError(res, 400, "Invalid specialization ID.");
      }

      const specializationExists = await Specialization.findOne({
        _id: specialization,
        isActive: true,
      });

      if (!specializationExists) {
        return sendError(res, 404, "Active specialization not found.");
      }

      doctor.specialization = specialization;
    }

    if (experience !== undefined) {
      const doctorExperience = Number(experience);

      if (
        experience === "" ||
        !Number.isFinite(doctorExperience) ||
        doctorExperience < 0
      ) {
        return sendError(
          res,
          400,
          "Experience must be a valid non-negative number."
        );
      }

      doctor.experience = doctorExperience;
    }

    if (bio !== undefined) {
      if (typeof bio !== "string") {
        return sendError(res, 400, "Bio must be a string.");
      }

      doctor.bio = bio.trim();
    }

    if (consultationFee !== undefined) {
      const fee = Number(consultationFee);

      if (
        consultationFee === "" ||
        !Number.isFinite(fee) ||
        fee < 0
      ) {
        return sendError(
          res,
          400,
          "Consultation fee must be a valid non-negative number."
        );
      }

      doctor.consultationFee = fee;
    }

    // Check uniqueness excluding this doctor's own User document.
    const duplicateUser = await User.findOne({
      _id: { $ne: user._id },
      $or: [
        { email: user.email },
        { username: user.username },
      ],
    });

    if (duplicateUser) {
      return sendError(res, 409, "Email or username already exists.");
    }

    // Save both documents atomically.
    session = await mongoose.startSession();

    await session.withTransaction(async () => {
      await user.save({ session });
      await doctor.save({ session });
    });

    const updatedDoctor = await Doctor.findById(id)
      .populate({
        path: "user",
        select: "name username email phone profileImage isActive",
      })
      .populate({
        path: "specialization",
        select: "name description isActive",
      });

    return res.status(200).json({
      success: true,
      message: "Doctor updated successfully.",
      doctor: updatedDoctor,
    });
  } catch (error) {
    console.error("Update doctor error:", error);

    if (error.code === 11000) {
      return sendError(res, 409, "Email or username already exists.");
    }

    return sendError(res, 500, "Server error while updating doctor.");
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

// DEACTIVATE DOCTOR (ADMIN)
const deactivateDoctor = async (req, res) => {
  let session;

  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return sendError(res, 400, "Invalid doctor ID.");
    }

    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return sendError(res, 404, "Doctor not found.");
    }

    const user = await User.findOne({
      _id: doctor.user,
      role: "doctor",
    });

    if (!user) {
      return sendError(res, 404, "Doctor account not found.");
    }

    if (!user.isActive && !doctor.isAvailable) {
      return sendError(res, 400, "Doctor is already deactivated.");
    }

    session = await mongoose.startSession();

    await session.withTransaction(async () => {
      await User.updateOne(
        { _id: user._id },
        { $set: { isActive: false } },
        { session }
      );

      await Doctor.updateOne(
        { _id: doctor._id },
        { $set: { isAvailable: false } },
        { session }
      );
    });

    return res.status(200).json({
      success: true,
      message: "Doctor deactivated successfully.",
    });
  } catch (error) {
    console.error("Deactivate doctor error:", error);
    return sendError(res, 500, "Server error while deactivating doctor.");
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};
// DOCTOR UPDATES OWN PROFILE
const updateMyDoctorProfile = async (req, res) => {
  try {
    const { name, phone, profileImage, bio } = req.body;

    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    const user = await User.findOne({
      _id: req.user._id,
      role: "doctor",
    });

    if (!user) {
      return res.status(404).json({
        message: "Doctor account not found",
      });
    }

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          message: "Name is required",
        });
      }
      user.name = name.trim();
    }

    if (phone !== undefined) {
      if (typeof phone !== "string") {
        return res.status(400).json({
          message: "Invalid phone number",
        });
      }
      user.phone = phone.trim();
    }

    if (profileImage !== undefined) {
      if (typeof profileImage !== "string") {
        return res.status(400).json({
          message: "Profile image must be a URL string",
        });
      }
      user.profileImage = profileImage.trim();
    }

    if (bio !== undefined) {
      if (typeof bio !== "string") {
        return res.status(400).json({
          message: "Bio must be a string",
        });
      }
      doctor.bio = bio.trim();
    }

    await user.save();
    await doctor.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      profile: {
        name: user.name,
        phone: user.phone,
        profileImage: user.profileImage,
        bio: doctor.bio,
      },
    });
  } catch (error) {
    console.error("Update own doctor profile error:", error);
    return res.status(500).json({
      message: "Failed to update profile",
    });
  }
};

module.exports = {
  createDoctor,
  getAllDoctors,
  getPublicDoctors,
  getDoctorById,
  updateDoctor,
  deactivateDoctor,
  updateMyDoctorProfile,
  getMyDoctorProfile,
};