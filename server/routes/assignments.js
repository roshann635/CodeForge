const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const Assignment = require("../models/Assignment");
const AssignmentSubmission = require("../models/AssignmentSubmission");
const Problem = require("../models/Problem");

/**
 * GET /api/assignments — Get student's active assignments
 */
router.get("/", protect, async (req, res) => {
  try {
    const assignments = await Assignment.find({
      status: "ACTIVE",
    })
      .populate("problemIds", "title difficulty topic")
      .sort({ deadline: 1 })
      .lean();

    // Check student progress for each assignment
    for (const assign of assignments) {
      const sub = await AssignmentSubmission.findOne({
        studentId: req.user._id,
        assignmentId: assign._id,
      });
      assign.studentSubmission = sub || null;
    }

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch assignments" });
  }
});

/**
 * POST /api/assignments — Create Assignment (Faculty / Admin only)
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
