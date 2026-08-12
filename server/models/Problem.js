const mongoose = require("mongoose");

const ProblemSchema = new mongoose.Schema(
  {
    problemId: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
      index: true,
    },
    subtopic: {
      type: String,
      default: "",
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },
    tags: [
      {
        type: String,
      },
    ],
    funcName: {
      type: String,
      default: "solution",
    },
    constraints: {
      type: String,
      default: "",
    },
    inputFormat: {
      type: String,
      default: "",
    },
    outputFormat: {
      type: String,
      default: "",
    },
    examples: [
      {
        input: String,
        output: String,
        explanation: String,
      },
    ],
    starterCode: {
      javascript: { type: String, default: "" },
      python: { type: String, default: "" },
      java: { type: String, default: "" },
      cpp: { type: String, default: "" },
    },
    expectedComplexity: {
      time: { type: String, default: "O(n)" },
      space: { type: String, default: "O(1)" },
    },
    referenceSolution: {
      javascript: String,
      python: String,
      java: String,
      cpp: String,
    },
    explanation: {
      type: String,
      default: "",
    },
    hints: [{ type: String }],
    judgeType: {
      type: String,
      enum: ["EXACT_OUTPUT", "SPECIAL_CHECKER", "FLOAT_TOLERANCE"],
      default: "EXACT_OUTPUT",
    },
    timeLimitMs: {
      type: Number,
      default: 2000,
    },
    memoryLimitKb: {
      type: Number,
      default: 128000,
    },
    status: {
      type: String,
      enum: ["DRAFT", "REVIEW", "PUBLISHED"],
      default: "PUBLISHED",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Problem", ProblemSchema);
