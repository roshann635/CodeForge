const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

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
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, "") : "",
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
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
    if (!email || !password || !name) {
      return res.status(400).json({ message: "Please provide name, email, and password." });
    }

    const cleanEmail = email.trim().toLowerCase();

    let user = await User.findOne({ email: cleanEmail });
    if (user && user.isVerified !== false) {
      return res.status(400).json({ message: "User already exists with this email." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000;

    pendingUsers.set(cleanEmail, {
      name,
      email: cleanEmail,
      password,
      role: role || "STUDENT",
      department: department || "CSE",
      batch: batch || "2nd Year",
      division: division || "Division A",
      otp,
      expires,
    });

    if (user && user.isVerified === false) {
      user.registrationOtp = otp;
      user.registrationOtpExpires = new Date(expires);
      await user.save();
    }

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      console.log(`Sending verification email to: ${cleanEmail}`);
      try {
        await Promise.race([
          transporter.sendMail({
            from: `"CodeForge" <${process.env.EMAIL_USER}>`,
            to: cleanEmail,
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
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Email server connection timed out")), 10000)
          ),
        ]);
      } catch (mailErr) {
        console.error("Email sending failed or timed out:", mailErr.message);
        console.log(`[FALLBACK REGISTRATION OTP for ${cleanEmail}]: ${otp}`);
      }
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
    const cleanEmail = email ? email.trim().toLowerCase() : "";
    let pendingUser = pendingUsers.get(cleanEmail);

    let user = await User.findOne({ email: cleanEmail });

    let validOtp = false;
    let name = pendingUser?.name;
    let password = pendingUser?.password;
    let role = pendingUser?.role || "STUDENT";
    let department = pendingUser?.department || "CSE";
    let batch = pendingUser?.batch || "2nd Year";
    let division = pendingUser?.division || "Division A";

    if (pendingUser) {
      if (pendingUser.otp === otp && pendingUser.expires >= Date.now()) {
        validOtp = true;
      }
    } else if (user && user.registrationOtp) {
      if (user.registrationOtp === otp && user.registrationOtpExpires && new Date(user.registrationOtpExpires).getTime() >= Date.now()) {
        validOtp = true;
        name = name || user.name;
        role = role || user.role;
        department = department || user.department;
        batch = batch || user.batch;
        division = division || user.division;
      }
    }

    if (!validOtp) {
      return res.status(400).json({ message: "Invalid or expired OTP. Please register again." });
    }

    if (user) {
      if (name) user.name = name;
      if (password) user.password = password;
      user.role = role;
      user.department = department;
      user.batch = batch;
      user.division = division;
      user.isVerified = true;
      user.registrationOtp = undefined;
      user.registrationOtpExpires = undefined;
      await user.save();
    } else {
      user = await User.create({
        name: name || "Operator",
        email: cleanEmail,
        password: password,
        role: role,
        department: department,
        batch: batch,
        division: division,
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
    }

    pendingUsers.delete(cleanEmail);

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
    console.error("Verification Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Student / General Auth Login
// @route   POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : "";
    const user = await User.findOne({ email: cleanEmail });

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
    const cleanEmail = email ? email.trim().toLowerCase() : "";

    let user = await User.findOne({ email: cleanEmail });

    const DEFAULT_ADMIN_KEY = process.env.ADMIN_KEY || "codeforge_admin_2026";

    if (!user && adminKey === DEFAULT_ADMIN_KEY) {
      user = await User.create({
        name: "Faculty Admin",
        email: cleanEmail,
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
    const cleanEmail = email ? email.trim().toLowerCase() : "";
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await Promise.race([
          transporter.sendMail({
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
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Email server connection timed out")), 10000)
          ),
        ]);
      } catch (mailErr) {
        console.error("Password reset email failed or timed out:", mailErr.message);
        console.log(`[FALLBACK RESET OTP for ${cleanEmail}]: ${otp}`);
      }
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
    const cleanEmail = email ? email.trim().toLowerCase() : "";
    const user = await User.findOne({ email: cleanEmail });

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
    const cleanEmail = email ? email.trim().toLowerCase() : "";
    const user = await User.findOne({ email: cleanEmail });

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

// @desc    Create faculty account (Admin only)
// @route   POST /api/auth/create-faculty
router.post("/create-faculty", protect, requireRole("ADMIN"), async (req, res) => {
  try {
    const { name, email, password, department, batch, division } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : "";
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ message: "User already exists with this email." });
    }

    const user = await User.create({
      name,
      email: cleanEmail,
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

