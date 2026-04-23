import React from "react";
import { AlertTriangle, CheckCircle, Lightbulb, Zap, Bug } from "lucide-react";

export default function CodeReviewPanel({ reviewData }) {
  if (!reviewData) return null;

  const { code_score, time_complexity, space_complexity, is_optimal, issues = [], strengths = [] } = reviewData;

  return (
    <div className="bg-dark-900 border border-neon-cyan/30 rounded-lg p-4 space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <h4 className="font-orbitron text-sm font-bold text-neon-cyan flex items-center gap-2">
          <Bug size={14} /> CODE REVIEW AI
        </h4>
        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
          code_score >= 70 ? "text-neon-green border-neon-green/40 bg-neon-green/10"
          : code_score >= 40 ? "text-neon-yellow border-neon-yellow/40 bg-neon-yellow/10"
          : "text-red-400 border-red-500/40 bg-red-500/10"
        }`}>
          Score: {code_score}/100
        </span>
      </div>

      {/* Complexity Analysis */}
      <div className="flex gap-3">
        <div className="flex-1 bg-dark-800 border border-dark-700 rounded p-2.5">
          <p className="text-[10px] text-gray-500 font-mono uppercase">Time</p>
          <p className="text-sm font-bold text-neon-yellow font-mono">{time_complexity || "—"}</p>
        </div>
        <div className="flex-1 bg-dark-800 border border-dark-700 rounded p-2.5">
          <p className="text-[10px] text-gray-500 font-mono uppercase">Space</p>
          <p className="text-sm font-bold text-neon-purple font-mono">{space_complexity || "—"}</p>
        </div>
        <div className="flex-1 bg-dark-800 border border-dark-700 rounded p-2.5">
          <p className="text-[10px] text-gray-500 font-mono uppercase">Optimal?</p>
          <p className={`text-sm font-bold ${is_optimal ? "text-neon-green" : "text-red-400"}`}>
            {is_optimal ? "✓ Yes" : "✗ No"}
          </p>
        </div>
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-red-400 font-mono uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle size={10} /> Issues Found
          </p>
          {issues.map((issue, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-gray-300 bg-red-500/5 border border-red-500/20 rounded p-2">
              <span className="text-red-400 mt-0.5">▪</span>
              <span>{issue}</span>
            </div>
          ))}
        </div>
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-neon-green font-mono uppercase tracking-wider flex items-center gap-1">
            <CheckCircle size={10} /> Strengths
          </p>
          {strengths.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-gray-300 bg-neon-green/5 border border-neon-green/20 rounded p-2">
              <span className="text-neon-green mt-0.5">✓</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      )}

      {/* Optimization hint */}
      {!is_optimal && (
        <div className="flex items-start gap-2 p-3 bg-neon-purple/5 border border-neon-purple/30 rounded-lg">
          <Lightbulb size={14} className="text-neon-purple flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-300">
            <strong className="text-neon-purple">Optimization Tip:</strong> Your solution works but isn't optimal. Consider a more efficient approach to reduce the complexity.
          </p>
        </div>
      )}
    </div>
  );
}
