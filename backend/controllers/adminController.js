
const mongoose = require("mongoose");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

// ADMIN DASHBOARD STATISTICS
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalAppointments,
      activePatients,
      totalDoctors,
      availableDoctors,
      unavailableDoctors,
    ] = await Promise.all([
      Appointment.countDocuments(),

      User.countDocuments({
        role: "patient",
        isActive: true,
      }),

      Doctor.countDocuments(),

      Doctor.countDocuments({
        isAvailable: true,
      }),

      Doctor.countDocuments({
        isAvailable: false,
      }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalAppointments,
        activePatients,
        totalDoctors,
        availableDoctors,
        unavailableDoctors,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};// ADMIN: GET ALL PATIENTS
const getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" })
      .select("-password -otpHash -otpExpiresAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: patients.length,
      patients,
    });
  } catch (error) {
    console.error("Get patients error:", error);
    return res.status(500).json({
      message: "Failed to fetch patients",
    });
  }
};

// ADMIN: GET PATIENT APPOINTMENT HISTORY
const getPatientAppointmentHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!mongoose.isValidObjectId(patientId)) {
      return res.status(400).json({
        message: "Invalid patient ID",
      });
    }

    const patient = await User.findOne({
      _id: patientId,
      role: "patient",
    });

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    const appointments = await Appointment.find({
      patient: patientId,
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
      patient: {
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
      },
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("Patient appointment history error:", error);
    return res.status(500).json({
      message: "Failed to fetch patient appointment history",
    });
  }
};
// ADMIN: GET ALL APPOINTMENTS WITH FILTERS
const getAllAppointments = async (req, res) => {
  try {
    const { date, status, patientName, doctorName } = req.query;

    const filter = {};

    if (status) {
      const allowedStatuses = [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid appointment status",
        });
      }

      filter.status = status;
    }

    if (date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({
          message: "Date must be in YYYY-MM-DD format",
        });
      }

      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1);

      filter.appointmentDate = {
        $gte: start,
        $lt: end,
      };
    }

    let appointments = await Appointment.find(filter)
      .populate("patient", "name email phone")
      .populate({
        path: "doctor",
        populate: [
          { path: "user", select: "name email profileImage" },
          { path: "specialization", select: "name" },
        ],
      })
      .sort({ appointmentDate: -1 });

    if (patientName) {
      appointments = appointments.filter((appointment) =>
        appointment.patient?.name
          ?.toLowerCase()
          .includes(patientName.toLowerCase())
      );
    }

    if (doctorName) {
      appointments = appointments.filter((appointment) =>
        appointment.doctor?.user?.name
          ?.toLowerCase()
          .includes(doctorName.toLowerCase())
      );
    }

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("Get all appointments error:", error);

    return res.status(500).json({
      message: "Failed to fetch appointments",
    });
  }
};
module.exports = {
  getDashboardStats,
  getAllPatients,
  getPatientAppointmentHistory,
  getAllAppointments,
};