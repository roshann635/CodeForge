/**
 * Seed initial admin/faculty accounts for demo.
 * Usage: node server/scripts/seedAdmin.js
 */
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");

const SEED_ACCOUNTS = [
  {
    name: "Admin Operator",
    email: "admin@codeforge.edu",
    password: "Admin@2026",
    role: "ADMIN",
    department: "CSE",
    batch: "Faculty",
    division: "All",
  },
  {
    name: "Prof. Sharma",
    email: "faculty@codeforge.edu",
    password: "Faculty@2026",
    role: "FACULTY",
    department: "CSE",
    batch: "2nd Year",
    division: "Division A",
  },
];

async function seed() {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/codeforge";
  await mongoose.connect(MONGO_URI);
  console.log("✅ MongoDB Connected\n");

  for (const account of SEED_ACCOUNTS) {
    const existing = await User.findOne({ email: account.email });
    if (existing) {
      existing.role = account.role;
      existing.name = account.name;
      existing.department = account.department;
      existing.isVerified = true;
      if (account.password) existing.password = account.password;
      await existing.save();
      console.log(`↻ Updated ${account.role}: ${account.email}`);
    } else {
      await User.create({ ...account, isVerified: true });
      console.log(`✓ Created ${account.role}: ${account.email}`);
    }
  }

  console.log("\nDemo credentials:");
  console.log("  Admin:   admin@codeforge.edu / Admin@2026");
  console.log("  Faculty: faculty@codeforge.edu / Faculty@2026");
  console.log(`  Admin Key: ${process.env.ADMIN_KEY || "codeforge_admin_2026"}`);
  console.log("\n🎉 Admin seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
