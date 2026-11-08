const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    appointmentDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },

    reason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Prevent duplicate appointments for the same patient,
// doctor and calendar date.
appointmentSchema.index(
  { patient: 1, doctor: 1, appointmentDate: 1 },
  { unique: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);