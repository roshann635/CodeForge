const mongoose = require("mongoose");

const TestCaseSchema = new mongoose.Schema(
  {
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
      index: true,
    },
    numericProblemId: {
      type: Number,
      required: true,
      index: true,
    },
    input: {
      type: String,
      required: true,
    },
    expectedOutput: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["PUBLIC", "HIDDEN", "EDGE", "STRESS"],
      default: "PUBLIC",
    },
    orderIndex: {
      type: Number,
      default: 0,
    },
    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TestCase", TestCaseSchema);
