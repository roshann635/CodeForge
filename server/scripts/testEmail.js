const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const nodemailer = require('nodemailer');

console.log("=== Testing Nodemailer SMTP Connection ===");
console.log("EMAIL_USER:", process.env.EMAIL_USER || "(not set)");
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "****" + process.env.EMAIL_PASS.slice(-4) : "(not set)");

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("❌ EMAIL_USER or EMAIL_PASS environment variables are missing!");
  process.exit(1);
}

// Test Option 1: service: "gmail"
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS.replace(/\s+/g, ''), // remove accidental spaces in app password
  },
  connectionTimeout: 10000,
  socketTimeout: 10000,
});

async function testSend() {
  try {
    console.log("🔄 Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP Transporter Connection Verified Successfully!");

    console.log("🔄 Attempting test email send to:", process.env.EMAIL_USER);
    const info = await transporter.sendMail({
      from: `"CodeForge Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "CodeForge Nodemailer Test",
      text: "If you receive this email, Nodemailer is working correctly!",
    });
    console.log("🎉 Test Email Sent Successfully! Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Email Send Failed:");
    console.error("Error Code:", error.code);
    console.error("Error Message:", error.message);
    if (error.response) console.error("SMTP Response:", error.response);
  }
}

testSend();
