import React from "react";

const TOPICS = [
  { key: "arrays", label: "Arrays" },
  { key: "trees", label: "Trees" },
  { key: "graphs", label: "Graphs" },
  { key: "dp", label: "DP" },
  { key: "hashing", label: "Hashing" },
  { key: "sorting", label: "Sorting" },
  { key: "linkedlist", label: "Linked List" },
  { key: "stack", label: "Stack/Queue" },
];

function getColor(val) {
  if (val >= 80) return "bg-neon-green/80 border-neon-green/60";
  if (val >= 60) return "bg-neon-green/50 border-neon-green/40";
  if (val >= 40) return "bg-neon-yellow/50 border-neon-yellow/40";
  if (val >= 20) return "bg-neon-yellow/30 border-neon-yellow/20";
  if (val > 0) return "bg-red-500/30 border-red-500/20";
  return "bg-dark-800 border-dark-700";
}

function getTextColor(val) {
  if (val >= 60) return "text-neon-green";
  if (val >= 40) return "text-neon-yellow";
  if (val > 0) return "text-red-400";
  return "text-gray-600";
}

export default function SkillHeatmap({ quizScores = {}, problemData = {}, voiceScores = [] }) {
  // Calculate mastery per topic from quiz scores, problem tags, and voice scores
  const topicMastery = TOPICS.map(({ key, label }) => {
    let score = 0;
    let sources = 0;

    // Quiz score for this topic
    const qScore = quizScores[key];
    if (qScore !== undefined && qScore !== null) {
      score += qScore;
      sources++;
    }

    // Voice scores matching this topic
    const matchingVoice = voiceScores.filter(
      (v) => v.topic && v.topic.toLowerCase().includes(key.toLowerCase())
    );
    if (matchingVoice.length > 0) {
      const avgVoice = matchingVoice.reduce((a, b) => a + (b.score || 0), 0) / matchingVoice.length;
      score += avgVoice;
      sources++;
    }

    // Problem solving data
    const pScore = problemData[key];
    if (pScore !== undefined) {
      score += pScore;
      sources++;
    }

    const mastery = sources > 0 ? Math.round(score / sources) : 0;
    return { key, label, mastery };
  });

  const maxMastery = Math.max(...topicMastery.map((t) => t.mastery), 1);

  return (
    <div className="glass-panel p-5 border border-dark-600">
      <h3 className="font-orbitron font-bold text-white text-sm mb-4 flex items-center gap-2">
        <span className="w-3 h-3 rounded bg-neon-green/80 inline-block" /> SKILL HEATMAP
      </h3>
      <div className="grid grid-cols-4 gap-2">
        {topicMastery.map(({ key, label, mastery }) => (
          <div
            key={key}
            className={`relative p-3 rounded-lg border transition-all duration-300 hover:scale-105 cursor-default ${getColor(mastery)}`}
            title={`${label}: ${mastery}%`}
          >
            <p className="text-[10px] font-mono text-gray-300 mb-1 truncate">{label}</p>
            <p className={`text-lg font-bold font-orbitron ${getTextColor(mastery)}`}>
              {mastery}%
            </p>
            <div className="mt-1.5 w-full bg-dark-900/50 rounded-full h-1 overflow-hidden">
              <div
                className={`h-1 rounded-full transition-all duration-700 ${mastery >= 60 ? "bg-neon-green" : mastery >= 30 ? "bg-neon-yellow" : "bg-red-500"}`}
                style={{ width: `${mastery}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-[10px] text-gray-500">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-neon-green/80" /> 80%+</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-neon-yellow/50" /> 40-79%</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500/30" /> 1-39%</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-dark-800 border border-dark-700" /> No data</span>
      </div>
    </div>
  );
}
