const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");

const router = express.Router();
const pendingUsers = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [email, user] of pendingUsers.entries()) {
    if (user.expires < now) {
      pendingUsers.delete(email);
    }
  }
}, 5 * 60 * 1000);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const JWT_SECRET = process.env.JWT_SECRET || "codeforge_hackathon_super_secret_key_123!";

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Register a new student user (Request OTP)
// @route   POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, department, batch, division } = req.body;

    let user = await User.findOne({ email });
    if (user && user.isVerified !== false) {
      return res.status(400).json({ message: "User already exists with this email." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    pendingUsers.set(email, {
      name,
      email,
      password,
      role: role || "STUDENT",
      department: department || "CSE",
      batch: batch || "2nd Year",
      division: division || "Division A",
      otp,
      expires: Date.now() + 10 * 60 * 1000,
    });

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      console.log(`Sending verification email to: ${email}`);
      await transporter.sendMail({
        from: `"CodeForge" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "CodeForge - Verify Your Identity",
        html: `
            <div style="font-family: Arial, sans-serif; background: #0a0a0a; padding: 20px; color: #fff; border: 1px solid #00f3ff; border-radius: 8px;">
                <h2 style="color: #00f3ff; margin-bottom: 20px;">CodeForge Registration</h2>
                <p>Operator, verify your identity to join the grid.</p>
                <p>Your access code is:</p>
                <h1 style="color: #bc13fe; letter-spacing: 4px; padding: 10px; background: #111; border: 1px solid #333; display: inline-block;">${otp}</h1>
                <p>This code will self-destruct in 10 minutes.</p>
            </div>
        `,
      });
    } else {
      console.log("Mock Email Sent. Registration OTP:", otp);
    }

    res.status(200).json({ message: "OTP sent to email for verification" });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Verify Registration OTP
// @route   POST /api/auth/verify-registration
router.post("/verify-registration", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const pendingUser = pendingUsers.get(email);

    if (!pendingUser) {
      return res.status(400).json({ message: "Registration session expired or not found. Please register again." });
    }

    if (pendingUser.otp !== otp || pendingUser.expires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = await User.create({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password,
      role: pendingUser.role || "STUDENT",
      department: pendingUser.department,
      batch: pendingUser.batch,
      division: pendingUser.division,
      isVerified: true,
      progress: {
        problemsSolved: 0,
        accuracy: 100,
        placementReadiness: 0,
        weakAreas: [],
        recentActivity: [
          {
            type: "system",
            text: "Identity Verified. Operator active.",
            time: new Date(),
          },
        ],
      },
    });

    pendingUsers.delete(email);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      batch: user.batch,
      division: user.division,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Student / General Auth Login
// @route   POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (user.isVerified === false) {
        return res.status(403).json({ message: "Account not verified. Please register again to receive a new OTP." });
      }
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "STUDENT",
        department: user.department,
        batch: user.batch,
        division: user.division,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Faculty / Admin Portal Dedicated Login
// @route   POST /api/auth/admin-login
router.post("/admin-login", async (req, res) => {
  try {
    const { email, password, adminKey } = req.body;

    let user = await User.findOne({ email });

    // Allow auto-upgrading to ADMIN or FACULTY if adminKey is provided (e.g. "codeforge_admin_secret")
    const DEFAULT_ADMIN_KEY = process.env.ADMIN_KEY || "codeforge_admin_2026";

    if (!user && adminKey === DEFAULT_ADMIN_KEY) {
      // Auto-create Admin Account on first login with key
      user = await User.create({
        name: "Faculty Admin",
        email,
        password,
        role: "ADMIN",
        isVerified: true,
      });
    }

    if (user && (await user.matchPassword(password))) {
      if (adminKey === DEFAULT_ADMIN_KEY && user.role === "STUDENT") {
        user.role = "FACULTY";
        await user.save();
      }

      if (user.role !== "FACULTY" && user.role !== "ADMIN") {
        return res.status(403).json({
          message: "Access Denied: Student accounts cannot log in through the Admin Portal. Please use Student Portal.",
        });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid admin credentials or invalid key" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Forgot Password (Send OTP)
// @route   POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({
        from: `"CodeForge" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "CodeForge - Password Reset OTP",
        html: `
            <div style="font-family: Arial, sans-serif; background: #0a0a0a; padding: 20px; color: #fff; border: 1px solid #00f3ff; border-radius: 8px;">
                <h2 style="color: #00f3ff; margin-bottom: 20px;">CodeForge Password Reset</h2>
                <p>Operator, we received a request to reset your password.</p>
                <p>Your authentication code is:</p>
                <h1 style="color: #bc13fe; letter-spacing: 4px; padding: 10px; background: #111; border: 1px solid #333; display: inline-block;">${otp}</h1>
                <p>This code will self-destruct in 10 minutes.</p>
            </div>
        `,
      });
    } else {
      console.log("Mock Email Sent. OTP:", otp);
    }

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.resetOtp !== otp || user.resetOtpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Reset Password
// @route   POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.resetOtp !== otp || user.resetOtpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

// @desc    Create faculty account (Admin only)
// @route   POST /api/auth/create-faculty
router.post("/create-faculty", protect, requireRole("ADMIN"), async (req, res) => {
  try {
    const { name, email, password, department, batch, division } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists with this email." });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "FACULTY",
      department: department || "CSE",
      batch: batch || "2nd Year",
      division: division || "Division A",
      isVerified: true,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    List all users (Admin only)
// @route   GET /api/auth/users
router.get("/users", protect, requireRole("ADMIN"), async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.department) filter.department = req.query.department;

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = { router, JWT_SECRET };
