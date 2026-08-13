const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/codeforge";

async function testFullRegisterFlow() {
  console.log("=== Testing Registration Endpoint with New User ===");
  const testEmail = `newuser_${Date.now()}@gmail.com`;
  console.log("Registering test email:", testEmail);

  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB.");

  const app = express();
  app.use(express.json());
  const authRouter = require('../routes/auth').router;
  app.use('/api/auth', authRouter);

  const server = app.listen(5099, async () => {
    console.log("Test server running on port 5099...");

    try {
      const res = await fetch("http://localhost:5099/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "New Test Operator",
          email: testEmail,
          password: "password123",
        }),
      });

      const data = await res.json();
      console.log("HTTP Status Code:", res.status);
      console.log("API Response Body:", data);
    } catch (err) {
      console.error("Fetch error:", err.message);
    } finally {
      server.close();
      await mongoose.disconnect();
      process.exit(0);
    }
  });
}

testFullRegisterFlow();
