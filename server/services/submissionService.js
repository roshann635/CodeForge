const Problem = require("../models/Problem");
const TestCase = require("../models/TestCase");
const Submission = require("../models/Submission");
const User = require("../models/User");
const { submitToJudge0 } = require("./judge0Service");
const { wrapCodeForExecution } = require("./codeWrapper");
const { normalizeOutput } = require("./outputUtils");
const { evaluateCodeWithContext } = require("../ai/ruleEngine");

/**
 * Run public test cases (Quick Run)
 */
async function runPublicTestCases({ numericProblemId, language, sourceCode, customInput }) {
  const problem = await Problem.findOne({ problemId: numericProblemId });
  let testCases = [];

  if (problem) {
    testCases = await TestCase.find({
      numericProblemId,
      type: "PUBLIC",
    }).sort({ orderIndex: 1 });
  }

  // Fallback to custom input or default
  if (testCases.length === 0 && customInput) {
    testCases = [{ input: customInput, expectedOutput: "" }];
  } else if (testCases.length === 0 && problem && problem.examples && problem.examples.length > 0) {
    testCases = problem.examples.map((ex) => ({
      input: ex.input,
      expectedOutput: ex.output,
    }));
  }

  if (testCases.length === 0) {
    testCases = [{ input: "", expectedOutput: "" }];
  }

  const results = [];
  let totalTime = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const funcName = problem ? problem.funcName : null;
    const wrapped = wrapCodeForExecution(sourceCode, language, funcName, tc.input);

    const judgeRes = await submitToJudge0({
      sourceCode: wrapped.code,
      language,
      stdin: wrapped.stdin,
      expectedOutput: tc.expectedOutput,
    });

    totalTime += judgeRes.time || 0;

    const isExecFailure = ["COMPILATION_ERROR", "RUNTIME_ERROR", "TIME_LIMIT_EXCEEDED", "MEMORY_LIMIT_EXCEEDED"].includes(
      judgeRes.status,
    );

    let passed = false;
    if (!isExecFailure) {
      const actualNorm = normalizeOutput(judgeRes.stdout);
      const expectedNorm = normalizeOutput(tc.expectedOutput);
      passed = tc.expectedOutput ? actualNorm === expectedNorm : judgeRes.status === "ACCEPTED";
    }

    results.push({
      testCaseIndex: i + 1,
      input: tc.input,
      expected: tc.expectedOutput,
      actual: judgeRes.stdout,
      error: judgeRes.compileOutput || judgeRes.stderr || null,
      passed,
      status: isExecFailure ? judgeRes.status : passed ? "ACCEPTED" : "WRONG_ANSWER",
      time: judgeRes.time,
    });
  }

  const allPassed = results.every((r) => r.passed);
  return {
    status: allPassed ? "PASSED" : "FAILED",
    results,
    totalRuntime: totalTime,
  };
}

/**
 * Judge code against all test cases without saving (for validation scripts)
 */
async function validateSubmission({ numericProblemId, language, sourceCode }) {
  const problem = await Problem.findOne({ problemId: numericProblemId });
  if (!problem) throw new Error(`Problem #${numericProblemId} not found.`);

  let dbTestCases = await TestCase.find({ numericProblemId }).sort({ orderIndex: 1 });
  if (dbTestCases.length === 0 && problem.examples) {
    dbTestCases = problem.examples.map((ex, idx) => ({
      _id: null,
      input: ex.input,
      expectedOutput: ex.output,
      type: idx === 0 ? "PUBLIC" : "HIDDEN",
    }));
  }

  const judgeResults = [];
  let passedCount = 0;
  let overallStatus = "ACCEPTED";

  for (const tc of dbTestCases) {
    const wrapped = wrapCodeForExecution(sourceCode, language, problem.funcName, tc.input);
    const judgeRes = await submitToJudge0({
      sourceCode: wrapped.code,
      language,
      stdin: wrapped.stdin,
      expectedOutput: tc.expectedOutput,
      cpuTimeLimit: Math.ceil(problem.timeLimitMs / 1000),
      memoryLimit: problem.memoryLimitKb,
    });

    let passed = false;
    if (judgeRes.status === "COMPILATION_ERROR") overallStatus = "COMPILATION_ERROR";
    else if (judgeRes.status === "TIME_LIMIT_EXCEEDED" && overallStatus === "ACCEPTED") overallStatus = "TIME_LIMIT_EXCEEDED";
    else if (judgeRes.status === "MEMORY_LIMIT_EXCEEDED" && overallStatus === "ACCEPTED") overallStatus = "MEMORY_LIMIT_EXCEEDED";
    else if (judgeRes.status === "RUNTIME_ERROR" && overallStatus === "ACCEPTED") overallStatus = "RUNTIME_ERROR";
    else {
      passed = normalizeOutput(judgeRes.stdout) === normalizeOutput(tc.expectedOutput);
      if (!passed && overallStatus === "ACCEPTED") overallStatus = "WRONG_ANSWER";
    }
    if (passed) passedCount++;

    judgeResults.push({
      testType: tc.type || "PUBLIC",
      input: tc.input,
      expected: tc.expectedOutput,
      actual: judgeRes.stdout,
      passed,
      status: passed ? "ACCEPTED" : judgeRes.status,
    });

    if (overallStatus === "COMPILATION_ERROR") break;
  }

  if (overallStatus === "WRONG_ANSWER" && passedCount > 0) overallStatus = "PARTIAL_ACCEPTED";

  return {
    status: overallStatus,
    testCasesPassed: passedCount,
    totalTestCases: dbTestCases.length,
    judgeResults,
  };
}

/**
 * Full Submission against ALL test cases (Public, Hidden, Edge, Stress)
 */
async function processFullSubmission({ userId, numericProblemId, language, sourceCode, assignmentId = null }) {
  const problem = await Problem.findOne({ problemId: numericProblemId });
  if (!problem) {
    throw new Error(`Problem #${numericProblemId} not found.`);
  }

  let dbTestCases = await TestCase.find({ numericProblemId }).sort({ orderIndex: 1 });

  // If no DB test cases yet, construct from problem examples
  if (dbTestCases.length === 0 && problem.examples) {
    dbTestCases = problem.examples.map((ex, idx) => ({
      _id: null,
      input: ex.input,
      expectedOutput: ex.output,
      type: idx === 0 ? "PUBLIC" : "HIDDEN",
    }));
  }

  if (dbTestCases.length === 0) {
    throw new Error("No test cases configured for this problem.");
  }

  const judgeResults = [];
  let passedCount = 0;
  let totalRuntime = 0;
  let maxMemory = 0;
  let overallStatus = "ACCEPTED";

  for (const tc of dbTestCases) {
    const wrapped = wrapCodeForExecution(sourceCode, language, problem.funcName, tc.input);
    const judgeRes = await submitToJudge0({
      sourceCode: wrapped.code,
      language,
      stdin: wrapped.stdin,
      expectedOutput: tc.expectedOutput,
      cpuTimeLimit: Math.ceil(problem.timeLimitMs / 1000),
      memoryLimit: problem.memoryLimitKb,
    });

    totalRuntime += judgeRes.time || 0;
    if (judgeRes.memory > maxMemory) maxMemory = judgeRes.memory;

    let passed = false;
    let tcStatus = judgeRes.status;

    if (judgeRes.status === "COMPILATION_ERROR") {
      overallStatus = "COMPILATION_ERROR";
    } else if (judgeRes.status === "TIME_LIMIT_EXCEEDED") {
      if (overallStatus !== "COMPILATION_ERROR") overallStatus = "TIME_LIMIT_EXCEEDED";
    } else if (judgeRes.status === "MEMORY_LIMIT_EXCEEDED") {
      if (overallStatus === "ACCEPTED") overallStatus = "MEMORY_LIMIT_EXCEEDED";
    } else if (judgeRes.status === "RUNTIME_ERROR") {
      if (overallStatus !== "COMPILATION_ERROR" && overallStatus !== "TIME_LIMIT_EXCEEDED") {
        overallStatus = "RUNTIME_ERROR";
      }
    } else {
      const actualNorm = normalizeOutput(judgeRes.stdout);
      const expectedNorm = normalizeOutput(tc.expectedOutput);
      passed = actualNorm === expectedNorm;
      if (!passed && overallStatus === "ACCEPTED") {
        overallStatus = "WRONG_ANSWER";
      }
      tcStatus = passed ? "ACCEPTED" : "WRONG_ANSWER";
    }

    if (passed) passedCount++;

    judgeResults.push({
      testCaseId: tc._id,
      testType: tc.type || "PUBLIC",
      status: tcStatus,
      input: tc.input,
      expected: tc.expectedOutput,
      actual: tc.type === "HIDDEN" || tc.type === "STRESS" ? "[Hidden Case Output]" : judgeRes.stdout,
      error: judgeRes.stderr || judgeRes.compileOutput,
      runtime: judgeRes.time,
      memory: judgeRes.memory,
      passed,
    });

    // Break early on compilation error
    if (overallStatus === "COMPILATION_ERROR") break;
  }

  // Count existing attempts
  const attemptCount = (await Submission.countDocuments({ studentId: userId, problemId: problem._id })) + 1;

  // Determine partial accepted if some passed but not all
  if (overallStatus === "WRONG_ANSWER" && passedCount > 0) {
    overallStatus = "PARTIAL_ACCEPTED";
  }

  // Save submission to MongoDB
  const submission = await Submission.create({
    studentId: userId,
    problemId: problem._id,
    numericProblemId,
    language,
    sourceCode,
    status: overallStatus,
    testCasesPassed: passedCount,
    totalTestCases: dbTestCases.length,
    runtime: Math.round(totalRuntime / dbTestCases.length),
    memory: maxMemory,
    attemptNumber: attemptCount,
    judgeResults,
    assignmentId,
  });

  // AI Explanation/Review generated AFTER deterministic result
  try {
    const aiRes = await evaluateCodeWithContext({
      sourceCode,
      problem,
      judgeStatus: overallStatus,
      passedCount,
      totalCases: dbTestCases.length,
      judgeResults,
    });
    submission.aiReview = {
      correctness: aiRes.correctness,
      optimization: aiRes.optimization,
      codeQuality: aiRes.codeQuality || 80,
      explanation: aiRes.explanation,
      estimatedComplexity: aiRes.estimatedComplexity,
    };
    await submission.save();
  } catch (err) {
    console.warn("AI review generation failed:", err.message);
  }

  // Update user progress if accepted
  if (overallStatus === "ACCEPTED" && userId) {
    try {
      const user = await User.findById(userId);
      if (user) {
        user.progress.problemsSolved = (user.progress.problemsSolved || 0) + 1;
        user.gamification.xp = (user.gamification.xp || 0) + 50;
        user.progress.recentActivity.unshift({
          type: "problem",
          text: `Accepted: ${problem.title} (+50 XP)`,
          time: new Date(),
        });
        await user.save();
      }
    } catch (e) {}
  }

  return submission;
}

module.exports = {
  runPublicTestCases,
  validateSubmission,
  processFullSubmission,
};
