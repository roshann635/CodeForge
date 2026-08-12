/**
 * Verify Judge0 connectivity with a simple program.
 * Usage: node server/scripts/testJudge0.js
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { submitToJudge0, checkJudge0Health, isSelfHosted } = require("../services/judge0Service");

async function main() {
  console.log("Testing Judge0 connectivity...\n");

  const health = await checkJudge0Health();
  if (health.ok) {
    console.log(`Mode: ${health.mode}`);
    console.log(`Judge0 version: ${health.version || "unknown"}`);
  } else {
    console.log("Judge0 health:", health.error);
    console.log("\nSelf-hosted setup:");
    console.log("  cd judge0 && ./start.sh   (Linux/VPS)");
    console.log("  cd judge0 && .\\start.ps1 (Windows Docker Desktop)");
    console.log("\nThen set in server/.env:");
    console.log("  JUDGE0_URL=http://localhost:2358");
    console.log("  JUDGE0_AUTH_TOKEN=codeforge_judge0_local_token");
  }
  console.log("JUDGE0_URL:", process.env.JUDGE0_URL || "(not set)");
  console.log("Self-hosted:", isSelfHosted() ? "yes" : "no");
  console.log("RapidAPI key:", process.env.JUDGE0_API_KEY ? "set" : "not set");
  console.log("");

  const testCases = [
    {
      name: "JavaScript Hello",
      language: "javascript",
      sourceCode: 'console.log("42");',
      stdin: "",
      expectedOutput: "42",
    },
    {
      name: "Python Two Sum style",
      language: "python",
      sourceCode: `def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target - n], i]
        seen[n] = i
    return []
import json
result = two_sum([2,7,11,15], 9)
print(json.dumps(result))`,
      stdin: "",
      expectedOutput: "[0, 1]",
    },
  ];

  let passed = 0;
  for (const tc of testCases) {
    process.stdout.write(`Running: ${tc.name}... `);
    const result = await submitToJudge0({
      sourceCode: tc.sourceCode,
      language: tc.language,
      stdin: tc.stdin,
      expectedOutput: tc.expectedOutput,
    });

    const ok = result.status === "ACCEPTED";
    console.log(ok ? "✓ PASSED" : `✗ FAILED (${result.status})`);
    if (!ok) {
      console.log("  stdout:", result.stdout);
      console.log("  stderr:", result.stderr || result.compileOutput);
    }
    if (ok) passed++;
  }

  console.log(`\n${passed}/${testCases.length} tests passed.`);
  process.exit(passed === testCases.length ? 0 : 1);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
