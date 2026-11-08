const Prescription = require("../models/Prescription");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

// Doctor adds a prescription
const createPrescription = async (req, res) => {
  try {
    const { appointmentId, medicines, notes, followUpDate } = req.body;

    if (!appointmentId || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({
        message: "Appointment and at least one medicine are required",
      });
    }

    for (const medicine of medicines) {
      if (
        !medicine.name?.trim() ||
        !medicine.dosage?.trim()
      ) {
        return res.status(400).json({
          message: "Each medicine must have a name and dosage",
        });
      }
    }

    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctor: doctor._id,
    });

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    if (appointment.status !== "completed") {
      return res.status(400).json({
        message: "Prescription can only be added to completed appointments",
      });
    }

    const existingPrescription = await Prescription.findOne({
      appointment: appointmentId,
    });

    if (existingPrescription) {
      return res.status(409).json({
        message: "Prescription already exists for this appointment",
      });
    }

    const prescription = await Prescription.create({
      appointment: appointment._id,
      doctor: doctor._id,
      patient: appointment.patient,
      medicines,
      notes,
      followUpDate: followUpDate || null,
    });

    res.status(201).json({
      message: "Prescription created successfully",
      prescription,
    });
  } catch (error) {
    console.error("Create prescription error:", error);
    res.status(500).json({
      message: "Failed to create prescription",
    });
  }
};

// Patient views their prescriptions
const getPatientPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      patient: req.user._id,
    })
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "name profileImage",
        },
      })
      .populate("appointment", "appointmentDate status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    console.error("Get patient prescriptions error:", error);
    res.status(500).json({
      message: "Failed to fetch prescriptions",
    });
  }
};

module.exports = {
  createPrescription,
  getPatientPrescriptions,
};