const mongoose = require("mongoose");

const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const DoctorAvailability = require("../models/DoctorAvailability");
const User = require("../models/User");

// Convert a date to YYYY-MM-DD using the Indian timezone.
const getIndiaDate = (date) => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

// Validate date format and reject invalid calendar dates.
const isValidDate = (dateString) => {
  if (typeof dateString !== "string") return false;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);

  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

// Convert YYYY-MM-DD into a Date at midnight UTC.
// Date-only values are compared consistently throughout the API.
const toDateOnly = (dateString) => {
  return new Date(`${dateString}T00:00:00.000Z`);
};

// BOOK APPOINTMENT (PATIENT)
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, reason } = req.body || {};

    if (!doctorId || !appointmentDate) {
      return res.status(400).json({
        success: false,
        message: "Doctor and appointment date are required.",
      });
    }

    if (!mongoose.isValidObjectId(doctorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID.",
      });
    }

    if (!isValidDate(appointmentDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment date. Use YYYY-MM-DD.",
      });
    }

    if (reason !== undefined && typeof reason !== "string") {
      return res.status(400).json({
        success: false,
        message: "Reason must be a string.",
      });
    }

    if (reason && reason.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: "Reason cannot exceed 500 characters.",
      });
    }

    // Prevent booking past dates.
    const today = getIndiaDate(new Date());

    if (appointmentDate < today) {
      return res.status(400).json({
        success: false,
        message: "You cannot book an appointment for a past date.",
      });
    }

    // Verify that the doctor exists and is active.
    const doctor = await Doctor.findOne({
      _id: doctorId,
      isAvailable: true,
    }).populate({
      path: "user",
      match: { role: "doctor", isActive: true },
      select: "_id",
    });

    if (!doctor || !doctor.user) {
      return res.status(404).json({
        success: false,
        message: "Doctor is not available.",
      });
    }

    // Check that the doctor has marked this date as available.
    const availability = await DoctorAvailability.findOne({
      doctor: doctorId,
      date: {
        $gte: toDateOnly(appointmentDate),
        $lt: new Date(toDateOnly(appointmentDate).getTime() + 86400000),
      },
      isAvailable: true,
    });

    if (!availability) {
      return res.status(400).json({
        success: false,
        message: "Doctor is not available on the selected date.",
      });
    }

    // Verify that the patient account is active.
    const patient = await User.findOne({
      _id: req.user._id,
      role: "patient",
      isActive: true,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient account not found or inactive.",
      });
    }

    // Prevent duplicate booking by the same patient for this doctor/date.
    const existingAppointment = await Appointment.findOne({
      patient: patient._id,
      doctor: doctorId,
      appointmentDate: toDateOnly(appointmentDate),
      status: { $ne: "cancelled" },
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: "You already have an appointment with this doctor on this date.",
      });
    }

    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctorId,
      appointmentDate: toDateOnly(appointmentDate),
      reason: reason ? reason.trim() : "",
      status: "pending",
    });

    const populatedAppointment = await Appointment.findById(
      appointment._id
    )
      .populate("patient", "name email phone")
      .populate({
        path: "doctor",
        populate: [
          { path: "user", select: "name profileImage" },
          { path: "specialization", select: "name" },
        ],
      });

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully.",
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error("Book appointment error:", error);

    // Handles duplicate-key errors from the unique index.
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You already have an appointment with this doctor on this date.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while booking appointment.",
    });
  }
};

// GET PATIENT APPOINTMENTS
const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.user._id,
    })
      .populate({
        path: "doctor",
        populate: [
          { path: "user", select: "name profileImage" },
          { path: "specialization", select: "name" },
        ],
      })
      .sort({ appointmentDate: -1 });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("Get patient appointments error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching appointments.",
    });
  }
};

// GET DOCTOR APPOINTMENTS
const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      user: req.user._id,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }

    const filter = {
      doctor: doctor._id,
    };

    // Optional date filter: ?date=2026-11-10
    if (req.query.date) {
      if (!isValidDate(req.query.date)) {
        return res.status(400).json({
          success: false,
          message: "Invalid date filter. Use YYYY-MM-DD.",
        });
      }

      filter.appointmentDate = toDateOnly(req.query.date);
    }

    const appointments = await Appointment.find(filter)
      .populate("patient", "name email phone")
      .sort({ appointmentDate: 1 });

    let filteredAppointments = appointments;

    // Optional patient name filter: ?patientName=Anu
    if (req.query.patientName) {
      const search = req.query.patientName.trim().toLowerCase();

      filteredAppointments = appointments.filter((appointment) => {
        return appointment.patient &&
          appointment.patient.name.toLowerCase().includes(search);
      });
    }

    return res.status(200).json({
      success: true,
      count: filteredAppointments.length,
      appointments: filteredAppointments,
    });
  } catch (error) {
    console.error("Get doctor appointments error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching doctor appointments.",
    });
  }
};

// UPDATE APPOINTMENT STATUS (DOCTOR)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID.",
      });
    }

    const allowedStatuses = ["confirmed", "completed", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment status.",
      });
    }

    const doctor = await Doctor.findOne({
      user: req.user._id,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }

    const appointment = await Appointment.findOne({
      _id: id,
      doctor: doctor._id,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    if (appointment.status === "cancelled" ||
        appointment.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "This appointment can no longer be updated.",
      });
    }

    appointment.status = status;
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Appointment status updated successfully.",
      appointment,
    });
  } catch (error) {
    console.error("Update appointment status error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating appointment.",
    });
  }
};

module.exports = {
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
};