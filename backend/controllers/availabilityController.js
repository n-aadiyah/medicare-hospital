const mongoose = require("mongoose");
const Doctor = require("../models/Doctor");
const DoctorAvailability = require("../models/DoctorAvailability");

// ADD AVAILABLE DATES
const addAvailability = async (req, res) => {
  try {
    const { dates } = req.body;

    if (!Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one available date.",
      });
    }

    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor || !doctor.isAvailable) {
      return res.status(404).json({
        success: false,
        message: "Active doctor profile not found.",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const validDates = [];

    for (const dateValue of dates) {
      if (typeof dateValue !== "string" ||
          !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return res.status(400).json({
          success: false,
          message: "Dates must use YYYY-MM-DD format.",
        });
      }

      const date = new Date(`${dateValue}T00:00:00.000Z`);

      if (
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== dateValue
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid date: ${dateValue}`,
        });
      }

      const todayString = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });

      if (dateValue < todayString) {
        return res.status(400).json({
          success: false,
          message: "Past dates cannot be added.",
        });
      }

      validDates.push(date);
    }

    // Remove duplicate dates from the submitted list
    const uniqueDates = [
      ...new Map(
        validDates.map((date) => [
          date.toISOString().slice(0, 10),
          date,
        ])
      ).values(),
    ];

    const existingDates = await DoctorAvailability.find({
      doctor: doctor._id,
      date: { $in: uniqueDates },
    }).select("date");

    const existingKeys = new Set(
      existingDates.map((item) => item.date.toISOString().slice(0, 10))
    );

    const newRecords = uniqueDates
      .filter((date) => !existingKeys.has(date.toISOString().slice(0, 10)))
      .map((date) => ({
        doctor: doctor._id,
        date,
        isAvailable: true,
      }));

    if (newRecords.length === 0) {
      return res.status(409).json({
        success: false,
        message: "All selected dates already exist.",
      });
    }

    await DoctorAvailability.insertMany(newRecords);

    return res.status(201).json({
      success: true,
      message: "Availability dates added successfully.",
      count: newRecords.length,
    });
  } catch (error) {
    console.error("Add availability error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Some availability dates already exist.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while adding availability.",
    });
  }
};

// GET LOGGED-IN DOCTOR'S AVAILABLE DATES
const getMyAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }

    const availability = await DoctorAvailability.find({
      doctor: doctor._id,
      isAvailable: true,
      date: { $gte: new Date(new Date().toLocaleDateString("en-US", {
        timeZone: "Asia/Kolkata",
      })) },
    }).sort({ date: 1 });

    return res.status(200).json({
      success: true,
      count: availability.length,
      availability,
    });
  } catch (error) {
    console.error("Get availability error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching availability.",
    });
  }
};

module.exports = {
  addAvailability,
  getMyAvailability,
};