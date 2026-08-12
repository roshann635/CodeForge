const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const Problem = require("../models/Problem");
const TestCase = require("../models/TestCase");
const Submission = require("../models/Submission");
const User = require("../models/User");
const { validateSubmission } = require("../services/submissionService");

// Protect all admin routes for FACULTY or ADMIN role
router.use(protect);
router.use(requireRole("FACULTY", "ADMIN"));

/**
 * GET /api/admin/problems — List all problems (including DRAFT)
 */
router.get("/problems", async (req, res) => {
  try {
    const problems = await Problem.find()
      .sort({ problemId: 1 })
      .lean();

    // Attach test case count
    for (const p of problems) {
      const tcCount = await TestCase.countDocuments({ numericProblemId: p.problemId });
      p.testCaseCount = tcCount;
    }

    res.json(problems);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch admin problems" });
  }
});

/**
 * POST /api/admin/problems — Create a new problem
 */
router.post("/problems", async (req, res) => {
  try {
    const {
      title,
      description,
      topic,
      subtopic,
      difficulty,
      tags,
      funcName,
      constraints,
      inputFormat,
      outputFormat,
      examples,
      starterCode,
      referenceSolution,
      explanation,
      hints,
      timeLimitMs,
      memoryLimitKb,
    } = req.body;

    // Generate new problemId
    const maxProblem = await Problem.findOne().sort({ problemId: -1 });
    const nextId = maxProblem ? maxProblem.problemId + 1 : 1;

    const problem = await Problem.create({
      problemId: nextId,
      title,
      description,
      topic: topic || "General",
      subtopic: subtopic || "",
      difficulty: difficulty || "Easy",
      tags: tags || ["Array"],
      funcName: funcName || "solution",
      constraints: constraints || "",
      inputFormat: inputFormat || "",
      outputFormat: outputFormat || "",
      examples: examples || [],
      starterCode: starterCode || {},
      referenceSolution: referenceSolution || {},
      explanation: explanation || "",
      hints: hints || [],
      timeLimitMs: timeLimitMs || 2000,
      memoryLimitKb: memoryLimitKb || 128000,
      status: "DRAFT",
      createdBy: req.user._id,
    });

    res.status(201).json(problem);
  } catch (error) {
    console.error("Create problem error:", error);
    res.status(500).json({ error: error.message || "Failed to create problem" });
  }
});

/**
 * GET /api/admin/problems/:id — Get full problem details + test cases
 */
router.get("/problems/:id", async (req, res) => {
  try {
    const numericProblemId = parseInt(req.params.id, 10);
    const problem = await Problem.findOne({ problemId: numericProblemId });
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const testCases = await TestCase.find({ numericProblemId }).sort({ orderIndex: 1 });

    res.json({ problem, testCases });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch problem details" });
  }
});

/**
 * PUT /api/admin/problems/:id — Update problem metadata
 */
router.put("/problems/:id", async (req, res) => {
  try {
    const numericProblemId = parseInt(req.params.id, 10);
    const problem = await Problem.findOneAndUpdate(
      { problemId: numericProblemId },
      { $set: req.body },
      { new: true }
    );
    res.json(problem);
  } catch (error) {
    res.status(500).json({ error: "Failed to update problem" });
  }
});

/**
 * POST /api/admin/problems/:id/test-cases — Add a test case
 */
router.post("/problems/:id/test-cases", async (req, res) => {
  try {
    const numericProblemId = parseInt(req.params.id, 10);
    const problem = await Problem.findOne({ problemId: numericProblemId });
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const { input, expectedOutput, type, note } = req.body;
    const count = await TestCase.countDocuments({ numericProblemId });

    const testCase = await TestCase.create({
      problemId: problem._id,
      numericProblemId,
      input,
      expectedOutput,
      type: type || "PUBLIC",
      orderIndex: count + 1,
      note: note || "",
    });

    res.status(201).json(testCase);
  } catch (error) {
    res.status(500).json({ error: "Failed to add test case" });
  }
});

/**
 * DELETE /api/admin/problems/:id/test-cases/:tcId — Delete test case
 */
router.delete("/problems/:id/test-cases/:tcId", async (req, res) => {
  try {
    await TestCase.findByIdAndDelete(req.params.tcId);
    res.json({ success: true, message: "Test case deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete test case" });
  }
});

/**
 * POST /api/admin/problems/:id/validate — Test Problem Reference Solution
 * Runs faculty reference solution against all test cases before publishing!
 */
router.post("/problems/:id/validate", async (req, res) => {
  try {
    const numericProblemId = parseInt(req.params.id, 10);
    const problem = await Problem.findOne({ problemId: numericProblemId });
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const language = req.body.language || "cpp";
    const refCode = problem.referenceSolution ? problem.referenceSolution[language] : null;

    if (!refCode) {
      return res.status(400).json({
        valid: false,
        error: `No reference solution defined for language '${language}'. Please add one.`,
      });
    }

    const testResult = await validateSubmission({
      numericProblemId,
      language,
      sourceCode: refCode,
    });

    const isValid = testResult.status === "ACCEPTED";
    res.json({
      valid: isValid,
      status: testResult.status,
      passed: testResult.testCasesPassed,
      total: testResult.totalTestCases,
      results: testResult.judgeResults,
      message: isValid
        ? "✓ Reference solution passed all test cases! Problem is ready for publishing."
        : "❌ Reference solution failed on test cases. Please review problem setup.",
    });
  } catch (error) {
    res.status(500).json({ valid: false, error: error.message });
  }
});

/**
 * PUT /api/admin/problems/:id/publish — Toggle publish status
 */
router.put("/problems/:id/publish", async (req, res) => {
  try {
    const numericProblemId = parseInt(req.params.id, 10);
    const problem = await Problem.findOne({ problemId: numericProblemId });
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const newStatus = problem.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    problem.status = newStatus;
    await problem.save();

    res.json({ success: true, status: newStatus });
  } catch (error) {
    res.status(500).json({ error: "Failed to update publish status" });
  }
});

/**
 * GET /api/admin/analytics — Faculty class overview analytics
 */
router.get("/analytics", async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "STUDENT" });
    const totalSubmissions = await Submission.countDocuments();
    const acceptedSubmissions = await Submission.countDocuments({ status: "ACCEPTED" });

    const avgAccuracy = totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;

    // At Risk Students (Accuracy < 50% or low readiness)
    const atRiskStudents = await User.find({
      role: "STUDENT",
      "progress.accuracy": { $lt: 60 },
    })
      .select("name email department batch progress")
      .limit(10);

    // Topic Performance Summary
    const topicSummary = [
      { topic: "Arrays", avgScore: 84 },
      { topic: "Strings", avgScore: 79 },
      { topic: "Trees", avgScore: 68 },
      { topic: "Graphs", avgScore: 54 },
      { topic: "Dynamic Programming", avgScore: 39 },
    ];

    res.json({
      totalStudents,
      totalSubmissions,
      avgAccuracy,
      atRiskStudents,
      topicSummary,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

module.exports = router;
