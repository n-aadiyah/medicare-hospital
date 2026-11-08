const mongoose = require("mongoose");

const doctorAvailabilitySchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate availability dates for the same doctor
doctorAvailabilitySchema.index(
  { doctor: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "DoctorAvailability",
  doctorAvailabilitySchema
);