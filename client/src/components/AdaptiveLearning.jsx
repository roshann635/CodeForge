import React from "react";
import { ArrowRight, TrendingUp, AlertTriangle, Target, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const TOPIC_PROBLEMS = {
  arrays: { path: "/practice", problems: ["Two Sum", "Maximum Subarray", "Binary Search"] },
  trees: { path: "/learn", problems: ["BST Traversal", "Tree Height", "LCA"] },
  graphs: { path: "/practice", problems: ["Number of Islands", "BFS/DFS Practice"] },
  dp: { path: "/learn", problems: ["Climbing Stairs", "Coin Change", "Knapsack"] },
  hashing: { path: "/practice", problems: ["Two Sum (HashMap)", "Group Anagrams"] },
  sorting: { path: "/practice", problems: ["Merge Sort", "Quick Sort"] },
};

export default function AdaptiveLearning({ quizScores = {}, problemsSolved = 0, voiceScores = [], weakAreas = [] }) {
  // Build recommendations from weak areas + quiz scores
  const recommendations = [];

  // From quiz scores — topics < 60% need work
  Object.entries(quizScores).forEach(([topic, score]) => {
    if (score < 60) {
      recommendations.push({
        topic,
        score,
        reason: `Quiz score ${score}% — below mastery threshold`,
        priority: score < 40 ? "critical" : "moderate",
        action: TOPIC_PROBLEMS[topic] || { path: "/learn", problems: [] },
      });
    }
  });

  // From explicit weak areas
  weakAreas.forEach((area) => {
    const areaKey = area.toLowerCase();
    if (!recommendations.find((r) => r.topic === areaKey)) {
      recommendations.push({
        topic: areaKey,
        score: 0,
        reason: `Identified as weak area from past performance`,
        priority: "critical",
        action: TOPIC_PROBLEMS[areaKey] || { path: "/learn", problems: [] },
      });
    }
  });

  // Sort by priority (critical first)
  recommendations.sort((a, b) => (a.priority === "critical" ? -1 : 1));

  // Improvement suggestions based on problem count
  const generalTips = [];
  if (problemsSolved < 3) {
    generalTips.push({ icon: Target, text: "Solve at least 5 problems to unlock pattern insights", color: "text-neon-cyan" });
  }
  if (voiceScores.length < 2) {
    generalTips.push({ icon: Target, text: "Complete 2+ voice explanations to calibrate communication score", color: "text-neon-purple" });
  }
  if (Object.keys(quizScores).length < 3) {
    generalTips.push({ icon: BookOpen, text: "Take quizzes in more topics to build your skill profile", color: "text-neon-yellow" });
  }

  return (
    <div className="glass-panel p-5 border border-dark-600">
      <h3 className="font-orbitron font-bold text-white text-sm mb-4 flex items-center gap-2">
        <TrendingUp size={16} className="text-neon-purple" /> ADAPTIVE LEARNING
      </h3>

      {recommendations.length > 0 ? (
        <div className="space-y-3">
          {recommendations.slice(0, 4).map((rec, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg border flex items-center justify-between gap-3 ${
                rec.priority === "critical"
                  ? "bg-red-500/5 border-red-500/30"
                  : "bg-neon-yellow/5 border-neon-yellow/30"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle
                    size={12}
                    className={rec.priority === "critical" ? "text-red-400" : "text-neon-yellow"}
                  />
                  <span className="text-sm font-bold text-white capitalize">{rec.topic}</span>
                  {rec.score > 0 && (
                    <span className="text-[10px] text-gray-500 font-mono">{rec.score}%</span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 truncate">{rec.reason}</p>
                {rec.action.problems.length > 0 && (
                  <p className="text-[10px] text-neon-cyan mt-1 font-mono">
                    → Try: {rec.action.problems.slice(0, 2).join(", ")}
                  </p>
                )}
              </div>
              <Link
                to={rec.action.path}
                className="flex-shrink-0 p-2 bg-dark-700 hover:bg-dark-600 rounded-lg border border-dark-600 transition-all"
              >
                <ArrowRight size={14} className="text-gray-300" />
              </Link>
            </div>
          ))}
        </div>
      ) : generalTips.length > 0 ? (
        <div className="space-y-2">
          {generalTips.map((tip, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-dark-900/50 rounded-lg border border-dark-700">
              <tip.icon size={14} className={tip.color} />
              <p className="text-xs text-gray-400">{tip.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-neon-green text-sm font-bold mb-1">🎉 All topics on track!</p>
          <p className="text-xs text-gray-500">Keep practicing to maintain your skills</p>
        </div>
      )}
    </div>
  );
}
