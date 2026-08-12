const Problem = require("../models/Problem");
const TestCase = require("../models/TestCase");
const Submission = require("../models/Submission");
const User = require("../models/User");
const { submitToJudge0 } = require("./judge0Service");
const { evaluateCode } = require("../ai/ruleEngine");

/**
 * Normalize output string for deterministic comparison
 */
function normalizeOutput(str) {
  if (!str) return "";
  return str
    .replace(/\r\n/g, "\n")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/'/g, '"')
    .replace(/True/g, "true")
    .replace(/False/g, "false")
    .replace(/None/g, "null")
    .toLowerCase();
}

/**
 * Wraps function call code for standard test execution when needed
 */
function wrapCodeForExecution(sourceCode, language, funcName, testInput) {
  if (!funcName) return sourceCode;

  let formattedArgs = testInput;
  if (!formattedArgs.startsWith("[") && formattedArgs.includes("], ")) {
    formattedArgs = formattedArgs
      .split("], ")
      .map((s, i) => (i === 0 ? s + "]" : s))
      .join(", ");
  }

  if (language === "javascript") {
    return `${sourceCode}\nconst result = ${funcName}(${formattedArgs});\nconsole.log(JSON.stringify(result));`;
  } else if (language === "python") {
    const pyFunc = funcName.replace(/[A-Z]/g, (l) => "_" + l.toLowerCase());
    return `import json\n${sourceCode}\nresult = ${pyFunc}(${formattedArgs})\nprint(json.dumps(result))`;
  } else if (language === "cpp") {
    // Standard input reading or wrapping
    return sourceCode;
  }
  return sourceCode;
}

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
    const execCode = wrapCodeForExecution(sourceCode, language, funcName, tc.input);

    const judgeRes = await submitToJudge0({
      sourceCode: execCode,
      language,
      stdin: tc.input,
      expectedOutput: tc.expectedOutput,
    });

    totalTime += judgeRes.time || 0;
    const actualNorm = normalizeOutput(judgeRes.stdout);
    const expectedNorm = normalizeOutput(tc.expectedOutput);
    const passed = tc.expectedOutput ? actualNorm === expectedNorm : judgeRes.status === "ACCEPTED";

    results.push({
      testCaseIndex: i + 1,
      input: tc.input,
      expected: tc.expectedOutput,
      actual: judgeRes.stdout,
      error: judgeRes.stderr || judgeRes.compileOutput,
      passed,
      status: judgeRes.status,
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
    const execCode = wrapCodeForExecution(sourceCode, language, problem.funcName, tc.input);
    const judgeRes = await submitToJudge0({
      sourceCode: execCode,
      language,
      stdin: tc.input,
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
    const aiRes = await evaluateCode(sourceCode, problem.title);
    submission.aiReview = {
      correctness: overallStatus === "ACCEPTED" ? "Passed all deterministic test cases." : `${passedCount}/${dbTestCases.length} test cases passed.`,
      optimization: aiRes.issues ? aiRes.issues.join(". ") : "Good solution.",
      codeQuality: aiRes.code_score || 80,
      explanation: aiRes.strengths ? aiRes.strengths.join(". ") : "Review complete.",
      estimatedComplexity: `${aiRes.time_complexity || "O(n)"} time, ${aiRes.space_complexity || "O(1)"} space`,
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
  processFullSubmission,
  normalizeOutput,
};
