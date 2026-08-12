import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import API_BASE from "../../config/api";
import {
  Users,
  Award,
  AlertTriangle,
  BarChart2,
  CheckCircle2,
  Plus,
  BookOpen,
  TrendingDown,
  ChevronRight,
  Shield,
  FileCode,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function FacultyDashboard() {
  const { token, user } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [anaRes, probRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/admin/problems`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (anaRes.ok) setAnalytics(await anaRes.json());
      if (probRes.ok) setProblems(await probRes.json());
    } catch (e) {}
    setLoading(false);
  };

  const togglePublish = async (problemId) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/problems/${problemId}/publish`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (e) {}
  };

  return (
    <div className="p-6 space-y-6 text-white bg-dark-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple flex items-center gap-3">
            <Shield className="text-neon-cyan" /> Faculty Control Center
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Department: {user?.department || "CSE"} | Welcome, Prof. {user?.name || "Faculty Operator"}
          </p>
        </div>

        <Link
          to="/admin/problems/new"
          className="flex items-center gap-2 bg-neon-cyan hover:bg-neon-cyan/80 text-black px-4 py-2 rounded-xl font-bold text-xs shadow-[0_0_12px_#00f3ff55] transition-all"
        >
          <Plus size={16} /> Create New Problem
        </Link>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-dark-800/60 border border-dark-700 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold">Total Students</span>
            <Users size={18} className="text-neon-cyan" />
          </div>
          <p className="text-3xl font-bold font-orbitron text-white">
            {analytics ? analytics.totalStudents || 82 : 82}
          </p>
          <p className="text-[11px] text-neon-green mt-1">Active CSE 2nd Year</p>
        </div>

        <div className="bg-dark-800/60 border border-dark-700 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold">Average Accuracy</span>
            <Award size={18} className="text-neon-green" />
          </div>
          <p className="text-3xl font-bold font-orbitron text-white">
            {analytics ? `${analytics.avgAccuracy}%` : "68%"}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Classroom Average</p>
        </div>

        <div className="bg-dark-800/60 border border-dark-700 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold">Most Difficult Topic</span>
            <BarChart2 size={18} className="text-neon-yellow" />
          </div>
          <p className="text-3xl font-bold font-orbitron text-neon-yellow">Dynamic Prog.</p>
          <p className="text-[11px] text-red-400 mt-1">Avg Score: 39%</p>
        </div>

        <div className="bg-dark-800/60 border border-dark-700 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold">Students At-Risk</span>
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <p className="text-3xl font-bold font-orbitron text-red-400">
            {analytics && analytics.atRiskStudents ? analytics.atRiskStudents.length : 11}
          </p>
          <p className="text-[11px] text-red-400 mt-1 font-medium">Requires Faculty Intervention</p>
        </div>
      </div>

      {/* Main Grid: Topic Heatmap & At-Risk Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Heatmap */}
        <div className="bg-dark-800/60 border border-dark-700 p-6 rounded-2xl space-y-4">
          <h2 className="text-base font-orbitron font-bold text-white flex items-center gap-2">
            <BarChart2 size={18} className="text-neon-cyan" /> Topic Performance Heatmap
          </h2>
          <div className="space-y-3">
            {[
              { topic: "Arrays & Searching", score: 87, color: "bg-neon-green" },
              { topic: "Strings & Hash Maps", score: 81, color: "bg-neon-green" },
              { topic: "Linked Lists", score: 74, color: "bg-neon-yellow" },
              { topic: "Trees & BST", score: 63, color: "bg-neon-yellow" },
              { topic: "Graphs (BFS/DFS)", score: 51, color: "bg-orange-500" },
              { topic: "Dynamic Programming", score: 39, color: "bg-red-500" },
            ].map((t, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-300">{t.topic}</span>
                  <span className="text-white font-bold">{t.score}%</span>
                </div>
                <div className="w-full h-2 bg-dark-900 rounded-full overflow-hidden">
                  <div className={`h-full ${t.color} rounded-full`} style={{ width: `${t.score}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* At Risk Students List */}
        <div className="bg-dark-800/60 border border-dark-700 p-6 rounded-2xl space-y-4">
          <h2 className="text-base font-orbitron font-bold text-white flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-400" /> At-Risk Students (Intervention List)
          </h2>
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {[
              { name: "Rahul Sharma", email: "rahul.s@college.edu", accuracy: 38, trend: "down" },
              { name: "Amit Kumar", email: "amit.k@college.edu", accuracy: 42, trend: "down" },
              { name: "Sneha Patel", email: "sneha.p@college.edu", accuracy: 46, trend: "stable" },
              { name: "Pooja Verma", email: "pooja.v@college.edu", accuracy: 48, trend: "down" },
            ].map((st, idx) => (
              <div key={idx} className="p-3 bg-dark-900/60 border border-dark-700 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">{st.name}</p>
                  <p className="text-gray-500 text-[11px]">{st.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-red-400 font-bold font-mono">{st.accuracy}% Accuracy</span>
                  <TrendingDown size={14} className="text-red-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Problem Management Section */}
      <div className="bg-dark-800/60 border border-dark-700 p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-orbitron font-bold text-white flex items-center gap-2">
            <FileCode size={18} className="text-neon-purple" /> Faculty Problem Repository
          </h2>
          <span className="text-xs text-gray-400">{problems.length} Total Problems</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-900 text-gray-400 font-orbitron uppercase border-b border-dark-700">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Title</th>
                <th className="p-3">Topic</th>
                <th className="p-3">Difficulty</th>
                <th className="p-3">Test Cases</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/50 text-gray-300">
              {problems.map((p) => (
                <tr key={p._id || p.problemId} className="hover:bg-dark-700/30 transition-colors">
                  <td className="p-3 font-mono font-bold text-neon-cyan">#{p.problemId}</td>
                  <td className="p-3 font-bold text-white">{p.title}</td>
                  <td className="p-3">{p.topic}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.difficulty === "Easy"
                          ? "bg-neon-green/10 text-neon-green"
                          : p.difficulty === "Medium"
                          ? "bg-neon-yellow/10 text-neon-yellow"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {p.difficulty}
                    </span>
                  </td>
                  <td className="p-3 font-mono">{p.testCaseCount || 4} Cases</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === "PUBLISHED"
                          ? "bg-neon-green/10 text-neon-green border border-neon-green/30"
                          : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      {p.status || "PUBLISHED"}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => togglePublish(p.problemId)}
                      className="px-2.5 py-1 bg-dark-700 hover:bg-dark-600 rounded text-[11px] font-bold transition-all"
                    >
                      {p.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                    </button>
                    <Link
                      to={`/codelab/${p.problemId}`}
                      className="px-2.5 py-1 bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan hover:text-black rounded text-[11px] font-bold transition-all inline-block"
                    >
                      Test in CodeLab
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
