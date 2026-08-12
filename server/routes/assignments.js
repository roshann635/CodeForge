const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const Assignment = require("../models/Assignment");
const AssignmentSubmission = require("../models/AssignmentSubmission");
const Problem = require("../models/Problem");
const Submission = require("../models/Submission");
const User = require("../models/User");

/**
 * GET /api/assignments — Student's active assignments (filtered by batch/division)
 */
router.get("/", protect, async (req, res) => {
  try {
    const filter = { status: "ACTIVE" };
    if (req.user.role === "STUDENT") {
      filter.$or = [
        { targetDepartment: req.user.department || "CSE" },
        { targetDepartment: { $exists: false } },
      ];
    }

    const assignments = await Assignment.find(filter)
      .populate("problemIds", "title difficulty topic problemId")
      .sort({ deadline: 1 })
      .lean();

    for (const assign of assignments) {
      const sub = await AssignmentSubmission.findOne({
        studentId: req.user._id,
        assignmentId: assign._id,
      });
      assign.studentSubmission = sub || null;
      assign.totalProblems = assign.numericProblemIds?.length || assign.problemIds?.length || 0;
    }

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch assignments" });
  }
});

/**
 * GET /api/assignments/admin/all — Faculty list all assignments
 */
router.get("/admin/all", protect, requireRole("FACULTY", "ADMIN"), async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    for (const a of assignments) {
      const subCount = await AssignmentSubmission.countDocuments({ assignmentId: a._id });
      a.submissionCount = subCount;
    }

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch assignments" });
  }
});

/**
 * GET /api/assignments/:id — Assignment detail with problems
 */
router.get("/:id", protect, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate("problemIds", "title difficulty topic problemId tags")
      .lean();

    if (!assignment) return res.status(404).json({ error: "Assignment not found" });

    const studentSub = await AssignmentSubmission.findOne({
      studentId: req.user._id,
      assignmentId: assignment._id,
    });

    res.json({ ...assignment, studentSubmission: studentSub });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch assignment" });
  }
});

/**
 * POST /api/assignments/:id/start — Begin assignment timer
 */
router.post("/:id/start", protect, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ error: "Assignment not found" });

    let sub = await AssignmentSubmission.findOne({
      studentId: req.user._id,
      assignmentId: assignment._id,
    });

    if (!sub) {
      sub = await AssignmentSubmission.create({
        studentId: req.user._id,
        assignmentId: assignment._id,
        totalProblems: assignment.numericProblemIds.length,
        startedAt: new Date(),
      });
    }

    res.json(sub);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/assignments — Create Assignment (Faculty / Admin)
 */
router.post("/", protect, requireRole("FACULTY", "ADMIN"), async (req, res) => {
  try {
    const {
      title,
      description,
      topics,
      difficulty,
      numericProblemIds,
      deadline,
      targetDepartment,
      targetBatch,
      targetDivision,
      isProctored,
    } = req.body;

    const problems = await Problem.find({ problemId: { $in: numericProblemIds } });
    const problemObjectIds = problems.map((p) => p._id);

    const assignment = await Assignment.create({
      title,
      description: description || "",
      topics: topics || ["General"],
      difficulty: difficulty || "Medium",
      problemIds: problemObjectIds,
      numericProblemIds: numericProblemIds || [],
      createdBy: req.user._id,
      targetDepartment: targetDepartment || "CSE",
      targetBatch: targetBatch || "2nd Year",
      targetDivision: targetDivision || "Division A",
      deadline: deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isProctored: isProctored || false,
      status: "ACTIVE",
    });

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to create assignment" });
  }
});

module.exports = router;
