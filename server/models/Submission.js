const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
      index: true,
    },
    numericProblemId: {
      type: Number,
      required: true,
    },
    language: {
      type: String,
      required: true,
      enum: ["javascript", "python", "java", "cpp"],
    },
    sourceCode: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "ACCEPTED",
        "WRONG_ANSWER",
        "COMPILATION_ERROR",
        "RUNTIME_ERROR",
        "TIME_LIMIT_EXCEEDED",
        "MEMORY_LIMIT_EXCEEDED",
        "PARTIAL_ACCEPTED",
        "PENDING",
      ],
      default: "PENDING",
    },
    testCasesPassed: {
      type: Number,
      default: 0,
    },
    totalTestCases: {
      type: Number,
      default: 0,
    },
    runtime: {
      type: Number, // in ms
      default: 0,
    },
    memory: {
      type: Number, // in KB
      default: 0,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
    judgeResults: [
      {
        testCaseId: { type: mongoose.Schema.Types.ObjectId, ref: "TestCase" },
        testType: { type: String, enum: ["PUBLIC", "HIDDEN", "EDGE", "STRESS"] },
        status: String,
        input: String,
        expected: String,
        actual: String,
        error: String,
        runtime: Number,
        memory: Number,
        passed: Boolean,
      },
    ],
    aiReview: {
      correctness: String,
      optimization: String,
      codeQuality: Number,
      explanation: String,
      estimatedComplexity: String,
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", SubmissionSchema);
