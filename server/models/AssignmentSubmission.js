const mongoose = require("mongoose");

const AssignmentSubmissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      index: true,
    },
    problemSubmissions: [
      {
        problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
        numericProblemId: Number,
        submissionId: { type: mongoose.Schema.Types.ObjectId, ref: "Submission" },
        status: String,
        passed: Boolean,
      },
    ],
    completedProblems: {
      type: Number,
      default: 0,
    },
    totalProblems: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number, // Percentage 0-100
      default: 0,
    },
    integrityScore: {
      type: Number, // Proctoring integrity score 0-100
      default: 100,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AssignmentSubmission", AssignmentSubmissionSchema);
