/**
 * Validate a problem's reference solution against all test cases.
 * Usage: node server/scripts/validateProblem.js --id 1 [--lang javascript]
 */
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Problem = require("../models/Problem");
const { validateSubmission } = require("../services/submissionService");

async function main() {
  const idIdx = process.argv.indexOf("--id");
  const numericId = parseInt(
    idIdx >= 0 ? process.argv[idIdx + 1] : process.argv.find((a) => a.startsWith("--id="))?.replace("--id=", "") || "1",
    10,
  );
  const langArg = process.argv.find((a) => a.startsWith("--lang=")) || (process.argv.indexOf("--lang") >= 0 ? `--lang=${process.argv[process.argv.indexOf("--lang") + 1]}` : "--lang=javascript");
  const language = langArg.replace("--lang=", "");

  const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/codeforge";
  await mongoose.connect(MONGO_URI);

  const problem = await Problem.findOne({ problemId: numericId });
  if (!problem) {
    console.error(`Problem #${numericId} not found. Run: node server/scripts/seedProblems.js`);
    process.exit(1);
  }

  const refCode = problem.referenceSolution?.[language];
  if (!refCode) {
    console.error(`No reference solution for language '${language}' on problem #${numericId}`);
    process.exit(1);
  }

  console.log(`Validating Problem #${numericId}: ${problem.title} (${language})\n`);

  const result = await validateSubmission({
    numericProblemId: numericId,
    language,
    sourceCode: refCode,
  });

  console.log(`Status: ${result.status}`);
  console.log(`Passed: ${result.testCasesPassed}/${result.totalTestCases}\n`);

  result.judgeResults.forEach((r, i) => {
    console.log(`  Case ${i + 1} (${r.testType}): ${r.passed ? "✓" : "✗"}${!r.passed ? ` expected=${r.expected}, got=${r.actual}` : ""}`);
  });

  await mongoose.disconnect();
  process.exit(result.status === "ACCEPTED" ? 0 : 1);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
