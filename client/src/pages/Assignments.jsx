import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API_BASE from "../config/api";
import {
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Loader,
  Terminal,
} from "lucide-react";

export default function Assignments() {
  const { token } = useContext(AuthContext);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchAssignments();
    else setLoading(false);
  }, [token]);

  const fetchAssignments = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/assignments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setAssignments(await res.json());
    } catch (e) {}
    setLoading(false);
  };

  const startAssignment = async (id) => {
    try {
      await fetch(`${API_BASE}/api/assignments/${id}/start`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAssignments();
    } catch (e) {}
  };

  if (!token) {
    return (
      <div className="text-center py-20 text-gray-400">
        <BookOpen size={48} className="mx-auto mb-4 text-neon-cyan opacity-50" />
        <p>Please log in to view your assignments.</p>
        <Link to="/login" className="text-neon-cyan hover:underline text-sm mt-2 inline-block">Login →</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <Loader className="animate-spin mr-2" size={20} /> Loading assignments...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-orbitron font-bold text-white flex items-center gap-2">
          <BookOpen className="text-neon-cyan" /> My Assignments
        </h1>
        <p className="text-sm text-gray-400 mt-1">Faculty-assigned coding problems with deadlines</p>
      </div>

      {assignments.length === 0 ? (
        <div className="glass-panel p-8 text-center text-gray-400">
          <AlertCircle size={32} className="mx-auto mb-3 opacity-50" />
          <p>No active assignments right now.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map((a) => {
            const deadline = new Date(a.deadline);
            const isOverdue = deadline < new Date();
            const progress = a.studentSubmission
              ? `${a.studentSubmission.completedProblems || 0}/${a.totalProblems || a.numericProblemIds?.length || 0}`
              : `0/${a.totalProblems || a.numericProblemIds?.length || 0}`;

            return (
              <div key={a._id} className="glass-panel p-5 border border-dark-700 hover:border-neon-cyan/30 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-white">{a.title}</h2>
                    <p className="text-sm text-gray-400 mt-1">{a.description || "Complete all problems before the deadline."}</p>
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className={isOverdue ? "text-red-400" : "text-neon-yellow"} />
                        Due: {deadline.toLocaleDateString()} {deadline.toLocaleTimeString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle size={12} className="text-neon-green" />
                        Progress: {progress}
                      </span>
                      {a.isProctored && (
                        <span className="text-neon-magenta border border-neon-magenta/40 px-2 py-0.5 rounded-full">Proctored</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {!a.studentSubmission && (
                      <button
                        onClick={() => startAssignment(a._id)}
                        className="px-4 py-2 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 rounded-lg text-xs font-bold hover:bg-neon-cyan/30 transition-all"
                      >
                        Start Assignment
                      </button>
                    )}
                  </div>
                </div>

                {/* Problem links */}
                <div className="mt-4 pt-4 border-t border-dark-700 space-y-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Problems</p>
                  <div className="flex flex-wrap gap-2">
                    {(a.problemIds || []).map((p) => (
                      <Link
                        key={p._id || p.problemId}
                        to={`/codelab/${p.problemId || p.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-800 border border-dark-600 rounded-lg text-xs text-gray-300 hover:border-neon-purple/50 hover:text-white transition-all"
                      >
                        <Terminal size={12} className="text-neon-purple" />
                        #{p.problemId} {p.title}
                        <ChevronRight size={12} />
                      </Link>
                    ))}
                    {(a.numericProblemIds || []).filter((id) => !(a.problemIds || []).some((p) => p.problemId === id)).map((id) => (
                      <Link
                        key={id}
                        to={`/codelab/${id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-800 border border-dark-600 rounded-lg text-xs text-gray-300 hover:border-neon-purple/50 hover:text-white transition-all"
                      >
                        <Terminal size={12} className="text-neon-purple" />
                        Problem #{id}
                        <ChevronRight size={12} />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
