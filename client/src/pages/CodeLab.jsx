import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { AuthContext } from "../context/AuthContext";
import API_BASE from "../config/api";
import {
  Play,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Cpu,
  Loader,
  Terminal,
  FileText,
  AlertTriangle,
  Lightbulb,
  History,
  Sparkles,
  ChevronLeft,
  Tag,
  ShieldAlert,
} from "lucide-react";

import { PROBLEMS as FALLBACK_PROBLEMS } from "../data/problems.js";

const diffColors = {
  Easy: "text-neon-green bg-neon-green/10 border-neon-green/40",
  Medium: "text-neon-yellow bg-neon-yellow/10 border-neon-yellow/40",
  Hard: "text-neon-magenta bg-neon-magenta/10 border-neon-magenta/40",
};

export default function CodeLab() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);

  const numericId = parseInt(problemId || "1", 10);
  const [problem, setProblem] = useState(null);
  const [loadingProblem, setLoadingProblem] = useState(true);

  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [activeTab, setActiveTab] = useState("console"); // console | testcases | ai | history
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHint, setShowHint] = useState(false);

  const langMonacoMap = {
    javascript: "javascript",
    python: "python",
    java: "java",
    cpp: "cpp",
  };

  useEffect(() => {
    const fetchProblem = async () => {
      setLoadingProblem(true);
      try {
        const res = await fetch(`${API_BASE}/api/problems/${numericId}`);
        if (res.ok) {
          const data = await res.json();
          setProblem(data);
        } else {
          const fallback = FALLBACK_PROBLEMS.find((p) => p.id === numericId) || FALLBACK_PROBLEMS[0];
          setProblem(fallback);
        }
      } catch {
        const fallback = FALLBACK_PROBLEMS.find((p) => p.id === numericId) || FALLBACK_PROBLEMS[0];
        setProblem(fallback);
      }
      setLoadingProblem(false);
    };
    fetchProblem();
  }, [numericId]);

  useEffect(() => {
    if (!problem) return;
    const starter = problem.starterCode ? problem.starterCode[language] : "";
    setCode(starter || "// Write code here\n");
  }, [numericId, language, problem]);

  useEffect(() => {
    if (token && numericId) {
      fetchSubmissionsHistory();
    }
  }, [token, numericId]);

  const fetchSubmissionsHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/code/submissions/${numericId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {}
  };

  // Quick Run (Public Test Cases)
  const handleRun = async () => {
    setIsRunning(true);
    setRunResult(null);
    setActiveTab("console");
    try {
      const res = await fetch(`${API_BASE}/api/code/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          problemId: numericId,
        }),
      });
      const data = await res.json();
      setRunResult(data);
    } catch (e) {
      setRunResult({ status: "FAILED", error: "Failed to connect to judge backend." });
    }
    setIsRunning(false);
  };

  // Full Submission (Deterministic Judge across Public + Hidden + Edge Cases)
  const handleSubmit = async () => {
    if (!token) {
      setSubmitResult({ status: "ERROR", error: "Please log in to submit your solution." });
      setActiveTab("console");
      return;
    }
    setIsSubmitting(true);
    setSubmitResult(null);
    setActiveTab("console");
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/code/submit`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          code,
          language,
          problemId: numericId,
        }),
      });
      const data = await res.json();
      setSubmitResult(data);
      if (token) fetchSubmissionsHistory();
    } catch (e) {
      setSubmitResult({ status: "ERROR", error: "Backend server unreachable." });
    }
    setIsSubmitting(false);
  };

  if (loadingProblem || !problem) {
    return (
      <div className="h-screen bg-dark-900 flex items-center justify-center text-gray-400">
        <Loader className="animate-spin mr-2" size={20} /> Loading problem...
      </div>
    );
  }

  return (
    <div className="h-screen bg-dark-900 text-white flex flex-col overflow-hidden">
      {/* Header bar */}
      <header className="h-14 bg-dark-800/80 border-b border-dark-700 px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/practice")}
            className="p-1.5 hover:bg-dark-700 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Terminal className="text-neon-cyan" size={20} />
            <h1 className="font-orbitron font-bold text-sm text-white">
              CodeLab <span className="text-gray-500 font-normal">| #{problem.id} {problem.title}</span>
            </h1>
          </div>
          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${diffColors[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="flex bg-dark-900 p-1 rounded-lg border border-dark-700">
            {["cpp", "java", "python", "javascript"].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1 rounded text-xs font-semibold uppercase transition-all ${
                  language === lang
                    ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 shadow-[0_0_8px_#00f3ff44]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {lang === "cpp" ? "C++" : lang}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-2 bg-dark-700 hover:bg-dark-600 border border-dark-600 text-gray-200 px-4 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
          >
            {isRunning ? <Loader size={14} className="animate-spin" /> : <Play size={14} />}
            {isRunning ? "Executing..." : "Run"}
          </button>

          <button
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-2 bg-neon-purple hover:bg-neon-purple/80 text-white px-5 py-1.5 rounded-lg text-xs font-bold shadow-[0_0_12px_#b026ff66] transition-all disabled:opacity-50"
          >
            {isSubmitting ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
            {isSubmitting ? "Judging..." : "Submit Code"}
          </button>
        </div>
      </header>

      {/* Main Split Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Problem Description Panel */}
        <div className="w-[420px] flex-shrink-0 bg-dark-900 border-r border-dark-700 flex flex-col overflow-y-auto p-5">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold font-orbitron text-white mb-2">{problem.title}</h2>
              <div className="flex flex-wrap gap-2 mb-3">
                {problem.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] bg-dark-800 text-gray-300 px-2 py-0.5 rounded border border-dark-700 flex items-center gap-1">
                    <Tag size={10} className="text-neon-cyan" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line border-t border-dark-800 pt-3">
              {problem.description}
            </div>

            {/* Examples */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <FileText size={14} className="text-neon-cyan" /> Examples
              </h3>
              {problem.examples.map((ex, i) => (
                <div key={i} className="bg-dark-800/60 border border-dark-700 p-3 rounded-xl space-y-1.5 font-mono text-xs">
                  <p className="text-neon-cyan font-bold">Example {i + 1}:</p>
                  <p className="text-gray-300">
                    <strong className="text-gray-500">Input:</strong> {ex.input}
                  </p>
                  <p className="text-gray-300">
                    <strong className="text-gray-500">Output:</strong> {ex.output}
                  </p>
                  {ex.explanation && <p className="text-gray-400 text-[11px] font-sans">Explanation: {ex.explanation}</p>}
                </div>
              ))}
            </div>

            {/* Constraints */}
            <div className="pt-2 border-t border-dark-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-neon-yellow" /> Constraints
              </h3>
              <ul className="text-xs text-gray-400 list-disc pl-4 space-y-1">
                <li>Time Limit: 2.0 seconds</li>
                <li>Memory Limit: 128 MB</li>
                <li>Supported Languages: C++, Java, Python, JavaScript</li>
              </ul>
            </div>

            {/* Hints Button */}
            <div className="pt-2 border-t border-dark-800">
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-1.5 text-xs font-medium text-neon-yellow hover:underline"
              >
                <Lightbulb size={14} /> {showHint ? "Hide Hint" : "Need a Hint?"}
              </button>
              {showHint && problem.hints && problem.hints.length > 0 && (
                <div className="mt-2 p-3 bg-neon-yellow/10 border border-neon-yellow/30 rounded-lg text-xs text-gray-300 animate-fade-in">
                  💡 {problem.hints[0]}
                </div>
              )}
              {showHint && (!problem.hints || problem.hints.length === 0) && (
                <div className="mt-2 p-3 bg-neon-yellow/10 border border-neon-yellow/30 rounded-lg text-xs text-gray-300 animate-fade-in">
                  💡 Consider edge cases and optimal time complexity for this problem.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Monaco Editor + Output Tabs */}
        <div className="flex-1 flex flex-col min-w-0 bg-dark-950">
          {/* Code Editor */}
          <div className="flex-1 min-h-[300px] relative">
            <Editor
              height="100%"
              theme="vs-dark"
              language={langMonacoMap[language]}
              value={code}
              onChange={(val) => setCode(val || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "Fira Code, monospace",
                padding: { top: 12, bottom: 12 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
              }}
            />
          </div>

          {/* Bottom Control & Result Panel */}
          <div className="h-64 border-t border-dark-700 bg-dark-900 flex flex-col">
            {/* Panel Tabs */}
            <div className="flex items-center gap-2 px-3 py-2 bg-dark-800/70 border-b border-dark-700 text-xs">
              <button
                onClick={() => setActiveTab("console")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all ${
                  activeTab === "console" ? "bg-dark-700 text-white border border-dark-600" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <Terminal size={14} className="text-neon-cyan" /> Console & Verdict
              </button>

              <button
                onClick={() => setActiveTab("testcases")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all ${
                  activeTab === "testcases" ? "bg-dark-700 text-white border border-dark-600" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <FileText size={14} className="text-neon-green" /> Test Cases
              </button>

              <button
                onClick={() => setActiveTab("ai")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all ${
                  activeTab === "ai" ? "bg-dark-700 text-white border border-dark-600" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <Sparkles size={14} className="text-neon-purple" /> AI Review
              </button>

              <button
                onClick={() => setActiveTab("history")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all ${
                  activeTab === "history" ? "bg-dark-700 text-white border border-dark-600" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <History size={14} className="text-neon-yellow" /> Submissions ({history.length})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-gray-300">
              {/* CONSOLE TAB */}
              {activeTab === "console" && (
                <div>
                  {!runResult && !submitResult && (
                    <p className="text-gray-500 font-sans italic">
                      Click <strong>Run</strong> to test public cases or <strong>Submit Code</strong> to run the full deterministic judge...
                    </p>
                  )}

                  {/* Submit Verdict View */}
                  {submitResult && (
                    <div className="space-y-3">
                      <div
                        className={`p-3 rounded-xl border flex items-center justify-between ${
                          submitResult.status === "ACCEPTED"
                            ? "bg-neon-green/10 border-neon-green/40 text-neon-green"
                            : "bg-red-500/10 border-red-500/40 text-red-400"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {submitResult.status === "ACCEPTED" ? <CheckCircle size={24} /> : <XCircle size={24} />}
                          <div>
                            <p className="font-bold text-base font-orbitron">
                              {submitResult.status === "ACCEPTED"
                                ? "ACCEPTED ✓"
                                : submitResult.status === "PARTIAL_ACCEPTED"
                                ? "PARTIALLY ACCEPTED"
                                : submitResult.status || "WRONG ANSWER"}
                            </p>
                            <p className="text-xs text-gray-300 font-sans">
                              Passed <strong>{submitResult.passed}</strong> / <strong>{submitResult.total}</strong> Test Cases ({submitResult.passPercentage}%)
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4 text-xs font-sans text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock size={14} /> {submitResult.runtime || 0} ms
                          </span>
                          <span className="flex items-center gap-1">
                            <Cpu size={14} /> {submitResult.memory || 0} KB
                          </span>
                        </div>
                      </div>

                      {/* Detailed Test Results */}
                      {submitResult.results && (
                        <div className="space-y-2 mt-2">
                          {submitResult.results.map((res, i) => (
                            <div
                              key={i}
                              className={`p-2.5 rounded-lg border flex items-center justify-between font-mono text-xs ${
                                res.passed ? "bg-dark-800/40 border-dark-700" : "bg-red-500/5 border-red-500/30"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {res.passed ? (
                                  <CheckCircle size={14} className="text-neon-green" />
                                ) : (
                                  <XCircle size={14} className="text-red-400" />
                                )}
                                <span>
                                  Test Case {i + 1} ({res.testType || "PUBLIC"})
                                </span>
                              </div>

                              <div className="flex items-center gap-4 text-gray-400">
                                <span>Input: {res.input}</span>
                                {res.passed ? (
                                  <span className="text-neon-green">Passed</span>
                                ) : (
                                  <span className="text-red-400">Expected: {res.expected} | Got: {res.actual}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Run Verdict View */}
                  {runResult && !submitResult && (
                    <div className="space-y-3">
                      <div
                        className={`p-3 rounded-xl border flex items-center justify-between ${
                          runResult.status === "PASSED"
                            ? "bg-neon-green/10 border-neon-green/40 text-neon-green"
                            : "bg-red-500/10 border-red-500/40 text-red-400"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold font-orbitron">
                          {runResult.status === "PASSED" ? <CheckCircle size={18} /> : <XCircle size={18} />}
                          <span>{runResult.status === "PASSED" ? "Public Test Cases Passed" : "Public Test Case Failed"}</span>
                        </div>
                        <span className="text-gray-400 text-xs font-sans">Runtime: {runResult.totalRuntime || 0} ms</span>
                      </div>

                      {runResult.results &&
                        runResult.results.map((r, idx) => (
                          <div key={idx} className="bg-dark-800 p-3 rounded-lg border border-dark-700 space-y-1">
                            <p className="font-bold text-gray-300">Test Case #{r.testCaseIndex}:</p>
                            <p>Input: {r.input}</p>
                            <p>Output: {r.actual}</p>
                            {r.expected && <p>Expected: {r.expected}</p>}
                            {r.error && <p className="text-red-400 mt-1">{r.error}</p>}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* TEST CASES TAB */}
              {activeTab === "testcases" && (
                <div className="space-y-3">
                  {problem.examples.map((ex, idx) => (
                    <div key={idx} className="bg-dark-800 p-3 rounded-lg border border-dark-700 space-y-1 font-mono text-xs">
                      <p className="text-neon-cyan font-bold">Public Case #{idx + 1}:</p>
                      <p className="text-gray-300">Input: {ex.input}</p>
                      <p className="text-gray-300">Expected Output: {ex.output}</p>
                    </div>
                  ))}
                  <div className="p-3 bg-dark-800/40 border border-dark-700 rounded-lg text-gray-400 font-sans text-xs">
                    🔒 Additional hidden, edge, and stress cases are executed automatically upon full submission.
                  </div>
                </div>
              )}

              {/* AI REVIEW TAB */}
              {activeTab === "ai" && (
                <div>
                  {submitResult && submitResult.aiReview ? (
                    <div className="space-y-3 font-sans">
                      <div className="p-3 bg-neon-purple/10 border border-neon-purple/30 rounded-xl space-y-2">
                        <p className="font-bold text-neon-purple text-sm flex items-center gap-1.5">
                          <Sparkles size={16} /> CodeForge AI Review
                        </p>
                        <p className="text-gray-300 text-xs">{submitResult.aiReview.correctness}</p>
                        <p className="text-gray-300 text-xs">
                          <strong>Optimization:</strong> {submitResult.aiReview.optimization}
                        </p>
                        <p className="text-gray-300 text-xs">
                          <strong>Estimated Complexity:</strong> {submitResult.aiReview.estimatedComplexity}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 font-sans italic">Submit your code to generate instant AI code quality and complexity review.</p>
                  )}
                </div>
              )}

              {/* SUBMISSION HISTORY TAB */}
              {activeTab === "history" && (
                <div className="space-y-2 font-sans">
                  {history.length === 0 ? (
                    <p className="text-gray-500 italic">No past submissions found for this problem.</p>
                  ) : (
                    history.map((sub, i) => (
                      <div
                        key={i}
                        className="p-3 bg-dark-800 rounded-lg border border-dark-700 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`font-bold ${
                              sub.status === "ACCEPTED" ? "text-neon-green" : "text-red-400"
                            }`}
                          >
                            {sub.status}
                          </span>
                          <span className="text-gray-400 uppercase font-mono">{sub.language}</span>
                          <span className="text-gray-400">
                            {sub.testCasesPassed}/{sub.totalTestCases} Passed
                          </span>
                        </div>
                        <span className="text-gray-500 text-[11px]">
                          {new Date(sub.createdAt).toLocaleDateString()} {new Date(sub.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
