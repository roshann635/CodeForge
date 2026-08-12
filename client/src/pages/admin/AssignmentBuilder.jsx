import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import API_BASE from "../../config/api";
import { Plus, Loader, BookOpen, Calendar, Shield } from "lucide-react";

export default function AssignmentBuilder() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    numericProblemIds: [],
    deadline: "",
    targetDepartment: "CSE",
    targetBatch: "2nd Year",
    targetDivision: "Division A",
    isProctored: false,
  });

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/problems`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProblems(data.filter((p) => p.status === "PUBLISHED"));
      }
    } catch (e) {}
    setLoading(false);
  };

  const toggleProblem = (id) => {
    setForm((prev) => ({
      ...prev,
      numericProblemIds: prev.numericProblemIds.includes(id)
        ? prev.numericProblemIds.filter((x) => x !== id)
        : [...prev.numericProblemIds, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.numericProblemIds.length === 0) {
      alert("Select at least one problem.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          deadline: form.deadline || new Date(Date.now() + 7 * 86400000).toISOString(),
        }),
      });
      if (res.ok) {
        navigate("/admin/dashboard");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create assignment");
      }
    } catch (e) {
      alert("Network error");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <Loader className="animate-spin mr-2" size={20} /> Loading...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 text-white">
      <h1 className="text-2xl font-orbitron font-bold flex items-center gap-2">
        <BookOpen className="text-neon-cyan" /> Create Assignment
      </h1>

      <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-5">
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider">Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Binary Search Week 3 Assignment"
            className="w-full mt-1 bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-sm focus:border-neon-cyan outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full mt-1 bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-sm focus:border-neon-cyan outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar size={12} /> Deadline
            </label>
            <input
              type="datetime-local"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="w-full mt-1 bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-sm focus:border-neon-cyan outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider">Target Division</label>
            <select
              value={form.targetDivision}
              onChange={(e) => setForm({ ...form, targetDivision: e.target.value })}
              className="w-full mt-1 bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-sm focus:border-neon-cyan outline-none"
            >
              <option>Division A</option>
              <option>Division B</option>
              <option>All Divisions</option>
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isProctored}
            onChange={(e) => setForm({ ...form, isProctored: e.target.checked })}
            className="accent-neon-purple"
          />
          <Shield size={14} className="text-neon-magenta" /> Enable proctored mode
        </label>

        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Select Problems ({form.numericProblemIds.length} selected)</label>
          <div className="grid gap-2 max-h-60 overflow-y-auto">
            {problems.map((p) => (
              <label
                key={p.problemId}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  form.numericProblemIds.includes(p.problemId)
                    ? "bg-neon-purple/10 border-neon-purple/40"
                    : "bg-dark-800 border-dark-700 hover:border-dark-600"
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.numericProblemIds.includes(p.problemId)}
                  onChange={() => toggleProblem(p.problemId)}
                  className="accent-neon-purple"
                />
                <span className="text-sm">#{p.problemId} {p.title}</span>
                <span className="text-xs text-gray-500 ml-auto">{p.difficulty}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-neon-cyan hover:bg-neon-cyan/80 text-black py-3 rounded-xl font-bold text-sm disabled:opacity-50"
        >
          {submitting ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
          {submitting ? "Creating..." : "Create Assignment"}
        </button>
      </form>
    </div>
  );
}
