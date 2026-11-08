
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const specializationRoutes = require("./routes/specializationRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MediCare API is running",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/specializations", specializationRoutes);
app.use("/api/doctors", doctorRoutes);
// Server configuration
const PORT = process.env.PORT || 5000;

// Connect database and start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`MediCare server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start MediCare server:", error.message);
    process.exit(1);
  }
};

startServer();
