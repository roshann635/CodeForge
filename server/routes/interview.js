const express = require("express");
const router = express.Router();
const { analyzeVoice } = require("../ai/ruleEngine");

router.post("/analyze", async (req, res) => {
  try {
    const { transcript, topic, code, thinkingTime } = req.body;

    // Use AI Engine (Assumes analyzeVoice returns an object with scores)
    const ai = await analyzeVoice(transcript, topic);

    const logicScore = ai.logic_score !== undefined ? ai.logic_score : ai.dsa_understanding || 50;
    const communicationScore = ai.communication_score !== undefined ? ai.communication_score : ai.communication || 50;

    // Improved Code Score
    let codeScore = 0;
    const codeStr = code || "";
    
    if (codeStr.includes("for") || codeStr.includes("while")) codeScore += 15;
    if (codeStr.includes("if")) codeScore += 15;
    if (codeStr.includes("return")) codeScore += 10;

    const lowerTopic = (topic || "").toLowerCase();
    if (lowerTopic === "binary search" || lowerTopic === "binary_search") {
      if (codeStr.includes("mid")) codeScore += 20;
      if (codeStr.includes("low") && codeStr.includes("high") || (codeStr.includes("left") && codeStr.includes("right"))) codeScore += 20;
    } else if (lowerTopic === "two sum" || lowerTopic === "two_sum") {
        if (codeStr.includes("Map") || codeStr.includes("{}")) codeScore += 30;
    }

    codeScore = Math.min(100, Math.max(0, codeScore));

    // Thinking Speed Score
    let speedScore = 100;
    const tTime = thinkingTime || 0;
    if (tTime > 60000) speedScore -= 20;
    if (tTime > 120000) speedScore -= 30;
    speedScore = Math.max(0, speedScore);

    // Edge Case Score
    let edgeScore = 30; // base score
    const tLower = (transcript || "").toLowerCase();
    if (tLower.includes("empty")) edgeScore += 20;
    if (tLower.includes("single")) edgeScore += 20;
    if (tLower.includes("edge")) edgeScore += 30;
    edgeScore = Math.min(100, edgeScore);

    // Pattern Score
    let patternScore = 20;
    if (tLower.includes("binary search") || tLower.includes("divide and conquer")) patternScore += 40;
    if (tLower.includes("two pointer") || tLower.includes("hash map")) patternScore += 40;
    patternScore = Math.min(100, patternScore);

    // Confidence Score
    let confidenceScore = 100;
    if (tLower.includes("uh")) confidenceScore -= 10;
    if (tLower.includes("um")) confidenceScore -= 10;
    if (tLower.includes("maybe")) confidenceScore -= 15;
    if (tLower.includes("i think")) confidenceScore -= 10;
    confidenceScore = Math.max(0, confidenceScore);

    // Final Score Formula
    const finalScore = Math.round(
      0.30 * codeScore +
      0.25 * logicScore +
      0.15 * communicationScore +
      0.10 * speedScore +
      0.10 * edgeScore +
      0.05 * patternScore +
      0.05 * confidenceScore
    );

    const followUpQuestion = "Can you optimize this further, or explain what would happen if the input scale doubled?";

    return res.json({
      codeScore: Math.round(codeScore),
      logicScore: Math.round(logicScore),
      communicationScore: Math.round(communicationScore),
      speedScore: Math.round(speedScore),
      edgeScore: Math.round(edgeScore),
      patternScore: Math.round(patternScore),
      confidenceScore: Math.round(confidenceScore),
      finalScore,
      followUpQuestion,
      feedback: ai.feedback || "Good attempt. Keep refining your approach."
    });
  } catch (error) {
    console.error("Interview API Error:", error);
    res.status(500).json({ error: "Failed to analyze interview" });
  }
});

module.exports = router;
