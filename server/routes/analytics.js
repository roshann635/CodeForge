const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const User = require("../models/User");
const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");
const AssignmentSubmission = require("../models/AssignmentSubmission");
const Problem = require("../models/Problem");

router.use(protect);
router.use(requireRole("FACULTY", "ADMIN"));

/**
 * GET /api/analytics/class — Class overview
 */
router.get("/class", async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "STUDENT" });
    const totalSubmissions = await Submission.countDocuments();
    const acceptedSubmissions = await Submission.countDocuments({ status: "ACCEPTED" });
    const avgAccuracy = totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;

    const students = await User.find({ role: "STUDENT" })
      .select("name email department batch progress")
      .limit(50)
      .lean();

    const avgScore = students.length
      ? Math.round(students.reduce((s, u) => s + (u.progress?.accuracy || 0), 0) / students.length)
      : 0;

    res.json({ totalStudents, totalSubmissions, avgAccuracy, avgScore, recentStudents: students.slice(0, 10) });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch class analytics" });
  }
});

/**
 * GET /api/analytics/topics — Topic performance heatmap
 */
router.get("/topics", async (req, res) => {
  try {
    const problems = await Problem.find({ status: "PUBLISHED" }).select("topic problemId").lean();
    const topicMap = {};

    for (const p of problems) {
      if (!topicMap[p.topic]) topicMap[p.topic] = { topic: p.topic, attempts: 0, accepted: 0 };
    }

    const submissions = await Submission.find().populate("problemId", "topic").lean();
    for (const sub of submissions) {
      const topic = sub.problemId?.topic || "General";
      if (!topicMap[topic]) topicMap[topic] = { topic, attempts: 0, accepted: 0 };
      topicMap[topic].attempts++;
      if (sub.status === "ACCEPTED") topicMap[topic].accepted++;
    }

    const topics = Object.values(topicMap).map((t) => ({
      ...t,
      avgScore: t.attempts > 0 ? Math.round((t.accepted / t.attempts) * 100) : 0,
    }));

    res.json(topics.sort((a, b) => a.avgScore - b.avgScore));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch topic analytics" });
  }
});

/**
 * GET /api/analytics/at-risk — Struggling students
 */
router.get("/at-risk", async (req, res) => {
  try {
    const atRisk = await User.find({
      role: "STUDENT",
      $or: [
        { "progress.accuracy": { $lt: 60 } },
        { "progress.problemsSolved": { $lt: 3 } },
      ],
    })
      .select("name email department batch progress")
      .sort({ "progress.accuracy": 1 })
      .limit(15)
      .lean();

    res.json(atRisk);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch at-risk students" });
  }
});

/**
 * GET /api/analytics/assignment/:id — Per-assignment analytics
 */
router.get("/assignment/:id", async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).lean();
    if (!assignment) return res.status(404).json({ error: "Assignment not found" });

    const submissions = await AssignmentSubmission.find({ assignmentId: assignment._id })
      .populate("studentId", "name email batch division")
      .lean();

    const avgScore = submissions.length
      ? Math.round(submissions.reduce((s, sub) => s + (sub.score || 0), 0) / submissions.length)
      : 0;

    res.json({
      assignment,
      totalSubmissions: submissions.length,
      avgScore,
      submissions,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch assignment analytics" });
  }
});

/**
 * GET /api/analytics/student/:id — Individual student profile
 */
router.get("/student/:id", async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select("-password").lean();
    if (!student) return res.status(404).json({ error: "Student not found" });

    const submissions = await Submission.find({ studentId: student._id })
      .populate("problemId", "title topic difficulty")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({ student, submissions });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch student analytics" });
  }
});

module.exports = router;
