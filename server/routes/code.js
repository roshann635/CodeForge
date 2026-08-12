const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { runPublicTestCases, processFullSubmission } = require("../services/submissionService");
const Submission = require("../models/Submission");
const Problem = require("../models/Problem");

/**
 * POST /api/code/run — Quick execution against PUBLIC test cases
 */
router.post("/run", async (req, res) => {
  try {
    const { code, language, problemId, customInput } = req.body;
    if (!code || !language) {
      return res.status(400).json({ error: "Code and language are required" });
    }

    const numericProblemId = parseInt(problemId, 10);
    const result = await runPublicTestCases({
      numericProblemId,
      language,
      sourceCode: code,
      customInput,
    });

    res.json(result);
  } catch (error) {
    console.error("Code run error:", error);
    res.status(500).json({ error: error.message || "Code execution failed" });
  }
});

/**
 * POST /api/code/submit — Full deterministic submission against ALL test cases
 */
router.post("/submit", protect, async (req, res) => {
  try {
    const { code, language, problemId, assignmentId } = req.body;
    if (!code || !language || !problemId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const numericProblemId = parseInt(problemId, 10);
    const userId = req.user._id;

    const submissionDoc = await processFullSubmission({
      userId,
      numericProblemId,
      language,
      sourceCode: code,
      assignmentId: assignmentId || null,
    });

    res.json({
      submissionId: submissionDoc._id,
      status: submissionDoc.status,
      passed: submissionDoc.testCasesPassed,
      total: submissionDoc.totalTestCases,
      passPercentage: Math.round((submissionDoc.testCasesPassed / submissionDoc.totalTestCases) * 100),
      runtime: submissionDoc.runtime,
      memory: submissionDoc.memory,
      attemptNumber: submissionDoc.attemptNumber,
      results: submissionDoc.judgeResults,
      aiReview: submissionDoc.aiReview,
      submittedAt: submissionDoc.createdAt,
    });
  } catch (error) {
    console.error("Code submit error:", error);
    res.status(500).json({ error: error.message || "Code submission failed" });
  }
});

/**
 * GET /api/code/submissions/:problemId — Get student submission history for a problem
 */
router.get("/submissions/:problemId", protect, async (req, res) => {
  try {
    const numericProblemId = parseInt(req.params.problemId, 10);
    const submissions = await Submission.find({
      studentId: req.user._id,
      numericProblemId,
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("status testCasesPassed totalTestCases runtime memory language createdAt attemptNumber aiReview");

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch submission history" });
  }
});

/**
 * GET /api/code/submission/:id — Get details of a specific submission
 */
router.get("/submission/:id", protect, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("problemId", "title difficulty topic")
      .lean();

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch submission detail" });
  }
});

module.exports = router;
