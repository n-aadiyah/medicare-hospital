
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const specializationRoutes = require("./routes/specializationRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://frontend-nadiya10.vercel.app",
  "https://frontend-m4p14ny5m-nadiya10.vercel.app",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

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
app.use("/api/availability", availabilityRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/admin", adminRoutes);
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
