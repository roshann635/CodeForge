const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const apiRoutes = require("./routes/api");
const aiRoutes = require("./routes/ai");
const authRouter = require("./routes/auth").router;
const codeRoutes = require("./routes/code");
const interviewRoutes = require("./routes/interview");
const proctorRoutes = require("./routes/proctor");

const app = express();

app.use(
  cors({
    origin: true, // Allow all origins in production
    credentials: true,
  }),
);
app.use(express.json({ limit: "5mb" }));

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/codeforge";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error: ", err.message));

// Auth routes
app.use("/api/auth", authRouter);

// Core API routes (problems, quiz, progress, leaderboard)
app.use("/api", apiRoutes);

// AI routes (code analysis, voice analysis)
app.use("/api/ai", aiRoutes);

// Code execution routes
app.use("/api/code", codeRoutes);

// Interview evaluation routes
app.use("/api/interview", interviewRoutes);

// Proctoring routes
app.use("/api/proctor", proctorRoutes);

app.get("/health", (req, res) => res.send("CodeForge Backend is Running"));

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, "../client/dist")));

// Catch all handler: send back index.html for client-side routing
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 CodeForge Server running on port ${PORT}`);
});
