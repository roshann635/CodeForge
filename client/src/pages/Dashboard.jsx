import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  Activity,
  Code,
  Target,
  Zap,
  BookOpen,
  BarChart3,
  Mic,
  ArrowRight,
  TrendingUp,
  Shield,
} from "lucide-react";
import { Link } from "react-router-dom";
import SkillHeatmap from "../components/SkillHeatmap";
import AdaptiveLearning from "../components/AdaptiveLearning";

function AnimatedCounter({ end, duration = 1500, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);

  return (
    <>
      {count}
      {suffix}
    </>
  );
}

function RadarChart({ data }) {
  const cx = 150,
    cy = 140,
    maxR = 110;
  const n = data.length;

  const getPoint = (i, val) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = (val / 100) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const gridLevels = [25, 50, 75, 100];

  return (
    <svg viewBox="0 0 300 280" className="w-full h-full max-w-[300px]">
      {/* Grid */}
      {gridLevels.map((level) => {
        const points = data.map((_, i) => getPoint(i, level));
        return (
          <polygon
            key={level}
            points={points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="#1a1a24"
            strokeWidth="1"
          />
        );
      })}

      {/* Axis lines */}
      {data.map((_, i) => {
        const p = getPoint(i, 100);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="#1a1a2488"
            strokeWidth="1"
          />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={data
          .map((d, i) => {
            const p = getPoint(i, d.value);
            return `${p.x},${p.y}`;
          })
          .join(" ")}
        fill="rgba(0,243,255,0.15)"
        stroke="#00f3ff"
        strokeWidth="2"
        style={{ filter: "drop-shadow(0 0 8px rgba(0,243,255,0.4))" }}
      />

      {/* Data points */}
      {data.map((d, i) => {
        const p = getPoint(i, d.value);
        return (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#00f3ff"
              stroke="#08080c"
              strokeWidth="2"
              style={{ filter: "drop-shadow(0 0 4px #00f3ff)" }}
            />
          </g>
        );
      })}

      {/* Labels */}
      {data.map((d, i) => {
        const p = getPoint(i, 125);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#9ca3af"
            fontSize="10"
            fontFamily="monospace"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const { token } = useContext(AuthContext);

  const interviewHistory = JSON.parse(localStorage.getItem("interview_history") || "[]");
  const avgThinkingTime = interviewHistory.length > 0 
    ? Math.round(interviewHistory.reduce((acc, curr) => acc + (curr.thinkingTime || 0), 0) / interviewHistory.length / 1000)
    : 0;

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:5000/api/progress", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setUserData(data))
      .catch((err) => console.log("Progress fetch failed, using defaults"));
  }, [token]);

  // Compute real metrics from actual data
  const problemsSolved = userData?.progress?.problemsSolved || 0;
  const totalProblems = 8;
  const codingScore = Math.min(100, Math.round((problemsSolved / totalProblems) * 100));

  const quizScores = userData?.progress?.quizScores;
  let avgQuizScore = 0;
  if (quizScores) {
    const vals = typeof quizScores === 'object' ? Object.values(quizScores) : [];
    if (vals.length > 0) avgQuizScore = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }

  const voiceScores = userData?.progress?.voiceScores || [];
  let avgVoiceScore = 0;
  if (voiceScores.length > 0) {
    avgVoiceScore = Math.round(voiceScores.reduce((a, b) => a + (b.score || 0), 0) / voiceScores.length);
  }

  const stats = [
    {
      label: "Placement Ready",
      value: userData?.progress?.placementReadiness || 0,
      suffix: "%",
      icon: <Target className="text-neon-cyan" />,
      gradient: "from-neon-cyan/20 to-transparent",
    },
    {
      label: "Problems Solved",
      value: problemsSolved,
      suffix: `/${totalProblems}`,
      icon: <Code className="text-neon-magenta" />,
      gradient: "from-neon-magenta/20 to-transparent",
    },
    {
      label: "Quiz Accuracy",
      value: avgQuizScore,
      suffix: "%",
      icon: <Activity className="text-neon-green" />,
      gradient: "from-neon-green/20 to-transparent",
    },
    {
      label: "Current Streak",
      value: userData?.gamification?.streak?.current || 0,
      suffix: " Days",
      icon: <Zap className="text-neon-yellow" />,
      gradient: "from-neon-yellow/20 to-transparent",
    },
    {
      label: "Avg Thinking Time",
      value: avgThinkingTime,
      suffix: "s",
      icon: <Activity className="text-neon-purple" />,
      gradient: "from-neon-purple/20 to-transparent",
    }
  ];

  // All radar values derived from REAL user data — no hardcoded scores
  const radarData = [
    { label: "Coding", value: codingScore },
    { label: "Logic", value: avgQuizScore },
    { label: "Comm", value: avgVoiceScore },
    { label: "Speed", value: avgThinkingTime > 0 ? Math.max(0, 100 - avgThinkingTime) : 0 },
    { label: "DSA", value: Math.round((codingScore + avgQuizScore) / 2) },
    { label: "Ready", value: userData?.progress?.placementReadiness || 0 }
  ];

  const activities = userData?.progress?.recentActivity?.map((act) => ({
    text: act.text,
    time: act.time ? new Date(act.time).toLocaleString() : "Recently",
    type:
      act.type === "problem"
        ? "success"
        : act.type === "quiz"
          ? "info"
          : act.type === "system"
            ? "warning"
            : "info",
    icon: act.type === "problem" ? Code : act.type === "quiz" ? BookOpen : Mic,
  })) || [];

  return (
    <div className="space-y-6 text-white">
      <h2 className="text-3xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple text-glow-cyan">
        Command Center
      </h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="glass-panel p-5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
            ></div>
            <div className="absolute top-0 right-0 p-3 opacity-40 group-hover:opacity-80 transition-opacity">
              {stat.icon}
            </div>
            <div className="relative">
              <p className="text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 font-orbitron">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity Feed */}
        <div className="lg:col-span-2 glass-panel p-6">
          <h3 className="text-lg font-bold mb-4 font-orbitron text-glow-magenta flex items-center gap-2">
            <Activity size={18} className="text-neon-magenta" /> Recent Activity
          </h3>
          <ul className="space-y-3">
            {activities.map((act, i) => {
              const Icon = act.icon;
              const typeColors = {
                success:
                  "text-neon-green bg-neon-green/10 border-neon-green/30",
                info: "text-neon-cyan bg-neon-cyan/10 border-neon-cyan/30",
                warning:
                  "text-neon-yellow bg-neon-yellow/10 border-neon-yellow/30",
              };
              return (
                <li
                  key={i}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-dark-700/30 transition-colors"
                >
                  <div
                    className={`p-2 rounded-lg border ${typeColors[act.type]}`}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-200 text-sm">
                      {act.text}
                    </p>
                    <p className="text-[11px] text-gray-500">{act.time}</p>
                  </div>
                </li>
              );
            })}
            {activities.length === 0 && (
              <li className="p-4 text-center text-sm font-mono text-gray-500 border border-dashed border-dark-600 rounded-lg">
                No active signals detected. Begin executing code in the Practice HQ to log history.
              </li>
            )}
          </ul>
        </div>

        {/* Radar Chart & Weak Areas */}
        <div className="glass-panel p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold mb-3 font-orbitron text-glow-cyan w-full text-center">
            Skill Radar
          </h3>
          <RadarChart data={radarData} />
          
          <div className="w-full mt-6 bg-dark-900/50 border border-dark-700 p-4 rounded-xl">
             <h4 className="text-sm font-orbitron text-neon-yellow mb-2 tracking-wide font-bold">⚠️ PERFORMANCE INSIGHTS</h4>
             <ul className="text-xs text-gray-400 font-mono space-y-2">
               {(userData?.progress?.weakAreas || []).length > 0 ? (
                 userData.progress.weakAreas.map((area, i) => (
                   <li key={i} className="flex items-start gap-2">
                     <span className="text-red-500 mt-0.5">▪</span>
                     Needs improvement: <span className="text-neon-yellow">{area}</span> — scored below 60% in quiz.
                   </li>
                 ))
               ) : codingScore === 0 && avgQuizScore === 0 ? (
                 <li className="flex items-start gap-2">
                   <span className="text-gray-500 mt-0.5">▪</span>
                   No data yet. Start solving problems and taking quizzes to see insights.
                 </li>
               ) : (
                 <li className="flex items-start gap-2">
                   <span className="text-neon-green mt-0.5">✓</span>
                   No weak areas detected. Keep up the good work!
                 </li>
               )}
             </ul>
          </div>
        </div>
      </div>

      {/* Skill Heatmap + Adaptive Learning */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkillHeatmap
          quizScores={quizScores ? (typeof quizScores === 'object' ? quizScores : {}) : {}}
          problemData={{}}
          voiceScores={voiceScores}
        />
        <AdaptiveLearning
          quizScores={quizScores ? (typeof quizScores === 'object' ? quizScores : {}) : {}}
          problemsSolved={problemsSolved}
          voiceScores={voiceScores}
          weakAreas={userData?.progress?.weakAreas || []}
        />
      </div>

      {/* Consistency Tracking */}
      {(() => {
        const history = JSON.parse(localStorage.getItem("interview_history") || "[]");
        if (history.length < 2) return null;
        const recent = history.slice(-5);
        const first = recent[0]?.finalScore || 0;
        const last = recent[recent.length - 1]?.finalScore || 0;
        const improvement = last - first;
        return (
          <div className="glass-panel p-5 border border-dark-600">
            <h3 className="font-orbitron font-bold text-white text-sm mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-neon-green" /> CONSISTENCY TRACKING
            </h3>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {recent.map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div
                        className={`w-full rounded-t ${h.finalScore >= 70 ? 'bg-neon-green/60' : h.finalScore >= 40 ? 'bg-neon-yellow/60' : 'bg-red-500/60'}`}
                        style={{ height: `${Math.max(8, h.finalScore * 0.6)}px` }}
                      />
                      <span className="text-[9px] text-gray-500 mt-1">{h.finalScore}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400">
                  {improvement > 0 ? (
                    <span className="text-neon-green">↑ Improved {improvement} points over last {recent.length} sessions</span>
                  ) : improvement < 0 ? (
                    <span className="text-red-400">↓ Declined {Math.abs(improvement)} points — review your weak areas</span>
                  ) : (
                    <span className="text-gray-500">Consistent performance across sessions</span>
                  )}
                </p>
              </div>
              <div className="text-center px-4 py-2 border border-dark-600 rounded-lg">
                <p className="text-[10px] text-gray-500 uppercase">Sessions</p>
                <p className="text-xl font-bold font-orbitron text-neon-cyan">{history.length}</p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Visualizer", to: "/visualize", icon: BarChart3, color: "neon-cyan" },
          { label: "Practice", to: "/practice", icon: Code, color: "neon-purple" },
          { label: "Learn", to: "/learn", icon: BookOpen, color: "neon-green" },
          { label: "Mock Interview", to: "/interview", icon: Mic, color: "neon-magenta" },
        ].map((action, i) => {
          const Icon = action.icon;
          const colorClasses = {
            "neon-cyan":
              "hover:border-neon-cyan/50 hover:shadow-[0_0_15px_#00f3ff22] group-hover:text-neon-cyan",
            "neon-purple":
              "hover:border-neon-purple/50 hover:shadow-[0_0_15px_#b026ff22] group-hover:text-neon-purple",
            "neon-green":
              "hover:border-neon-green/50 hover:shadow-[0_0_15px_#39ff1422] group-hover:text-neon-green",
            "neon-magenta":
              "hover:border-neon-magenta/50 hover:shadow-[0_0_15px_#ff00ea22] group-hover:text-neon-magenta",
          };
          return (
            <Link
              key={i}
              to={action.to}
              className={`glass-panel p-4 flex items-center justify-between group transition-all duration-300 border border-dark-600 ${colorClasses[action.color]}`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={20}
                  className={`text-gray-500 ${colorClasses[action.color]} transition-colors`}
                />
                <span className="font-medium text-gray-300 group-hover:text-white transition-colors text-sm">
                  {action.label}
                </span>
              </div>
              <ArrowRight
                size={16}
                className="text-gray-600 group-hover:text-gray-400 transition-colors"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
