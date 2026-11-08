
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");

const seedAdmin = async () => {
  try {
    const { ADMIN_NAME, ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD } =
      process.env;

    if (!ADMIN_NAME || !ADMIN_USERNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error("Please configure all ADMIN_* variables in .env");
    }

    // Check whether an admin already exists
    const existingAdmin = await User.findOne({
      role: "admin",
    });

    if (existingAdmin) {
      console.log("An admin account already exists. No changes made.");
      return;
    }

    // Create the initial admin
    const admin = await User.create({
      name: ADMIN_NAME,
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "admin",
      isEmailVerified: true,
      isActive: true,
    });

    console.log("Admin account created successfully.");
    console.log("Admin username:", admin.username);
  } catch (error) {
    console.error("Admin seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

const start = async () => {
  try {
    await connectDB();
    await seedAdmin();
  } catch (error) {
    console.error("Database connection failed:", error.message);
    await mongoose.disconnect();
    process.exitCode = 1;
  }
};

start();
