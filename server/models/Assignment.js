const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    topics: [{ type: String }],
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    problemIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
      },
    ],
    numericProblemIds: [{ type: Number }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetDepartment: {
      type: String,
      default: "CSE",
    },
    targetBatch: {
      type: String,
      default: "2nd Year",
    },
    targetDivision: {
      type: String,
      default: "Division A",
    },
    deadline: {
      type: Date,
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    isProctored: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "CLOSED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", AssignmentSchema);
