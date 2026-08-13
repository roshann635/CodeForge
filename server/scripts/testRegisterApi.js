const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/codeforge";

async function testAuthRegister() {
  console.log("=== Testing Registration Email Trigger ===");
  const testEmail = "roshanjadhav2769@gmail.com";

  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    let user = await User.findOne({ email: testEmail });
    if (user) {
      console.log(`User ${testEmail} status in DB: isVerified = ${user.isVerified}`);
    } else {
      console.log(`User ${testEmail} does NOT exist in DB yet.`);
    }

    const authRoute = require('../routes/auth');
    console.log("Testing Nodemailer sendMailHelper directly...");

    // We call the transporter verification directly
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, "") : "",
      },
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Sending test OTP:", otp, "to:", testEmail);

    const info = await transporter.sendMail({
      from: `"CodeForge" <${process.env.EMAIL_USER}>`,
      to: testEmail,
      subject: "CodeForge - Verify Your Identity",
      html: `
        <div style="font-family: Arial, sans-serif; background: #0a0a0a; padding: 20px; color: #fff; border: 1px solid #00f3ff; border-radius: 8px;">
            <h2 style="color: #00f3ff; margin-bottom: 20px;">CodeForge Registration OTP</h2>
            <p>Your access code is: <strong style="color: #bc13fe; font-size: 24px;">${otp}</strong></p>
        </div>
      `,
    });

    console.log("✅ Email sent successfully! ID:", info.messageId);
  } catch (err) {
    console.error("❌ Error during test:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testAuthRegister();
