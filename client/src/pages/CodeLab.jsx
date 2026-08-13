import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
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
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  GripHorizontal,
} from "lucide-react";

import { PROBLEMS as FALLBACK_PROBLEMS } from "../data/problems.js";

const diffColors = {
  Easy: "text-neon-green bg-neon-green/10 border-neon-green/40",
  Medium: "text-neon-yellow bg-neon-yellow/10 border-neon-yellow/40",
  Hard: "text-neon-magenta bg-neon-magenta/10 border-neon-magenta/40",
};

/* ───── Small Copyable Output Block ───── */
function OutputBlock({ value }) {
  const [copied, setCopied] = useState(false);
  const text = value == null ? "" : String(value);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="relative group">
      <pre className="bg-dark-900/60 rounded-md px-3 py-2 text-xs font-mono text-gray-200 overflow-x-auto overflow-y-auto max-h-[120px] whitespace-pre">
        {text || <span className="text-gray-600 italic">—</span>}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-1.5 right-1.5 p-1 rounded bg-dark-700/80 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Copy output"
      >
        {copied ? <Check size={12} className="text-neon-green" /> : <Copy size={12} />}
      </button>
    </div>
  );
}

/* ───── Structured Test Case Card ───── */
function TestCaseCard({ index, passed, input, expected, actual, testType, error }) {
  const isPassed = passed === true;
  return (
    <div
      className={`rounded-xl border overflow-hidden ${
        isPassed ? "bg-dark-800/40 border-dark-700" : "bg-red-500/5 border-red-500/30"
      }`}
    >
      {/* Card Header */}
      <div className={`flex items-center justify-between px-3 py-2 border-b ${
        isPassed ? "border-dark-700 bg-dark-800/60" : "border-red-500/20 bg-red-500/5"
      }`}>
        <div className="flex items-center gap-2 text-xs font-medium">
          {isPassed ? (
            <CheckCircle size={14} className="text-neon-green" />
          ) : (
            <XCircle size={14} className="text-red-400" />
          )}
          <span className="text-gray-200">Test Case {index}</span>
          {testType && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-dark-700 text-gray-400 uppercase">
              {testType}
            </span>
          )}
        </div>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-md ${
            isPassed
              ? "text-neon-green bg-neon-green/10"
              : "text-red-400 bg-red-500/10"
          }`}
        >
          {isPassed ? "PASSED" : "FAILED"}
        </span>
      </div>

      {/* Card Body — labeled rows */}
      <div className="px-3 py-2.5 space-y-2">
        {input != null && (
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium block mb-1">Input</span>
            <OutputBlock value={input} />
          </div>
        )}
        {expected != null && (
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium block mb-1">Expected</span>
            <OutputBlock value={expected} />
          </div>
        )}
        {actual != null && (
          <div>
            <span className={`text-[10px] uppercase tracking-wider font-medium block mb-1 ${isPassed ? "text-gray-400" : "text-red-400"}`}>
              {isPassed ? "Actual" : "Your Output"}
            </span>
            <OutputBlock value={actual} />
          </div>
        )}
        {error && (
          <div>
            <span className="text-[10px] uppercase tracking-wider text-red-400 font-medium block mb-1">Error</span>
            <pre className="bg-red-500/10 rounded-md px-3 py-2 text-xs font-mono text-red-300 overflow-x-auto overflow-y-auto max-h-[80px] whitespace-pre">
              {error}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CodeLab() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);

  const numericId = parseInt(problemId || "1", 10);
  const [problem, setProblem] = useState(null);
  const [loadingProblem, setLoadingProblem] = useState(true);

  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [activeTab, setActiveTab] = useState("console");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHint, setShowHint] = useState(false);

  // Reset code confirmation
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // AI Review notification badge
  const [hasNewAiReview, setHasNewAiReview] = useState(false);

  // ───── Resizable Bottom Panel State ─────
  const DEFAULT_BOTTOM = 300;
  const MIN_BOTTOM = 40;
  const [bottomPanelHeight, setBottomPanelHeight] = useState(DEFAULT_BOTTOM);
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);
  const [isBottomMaximized, setIsBottomMaximized] = useState(false);
  const bottomDragRef = useRef(null);

  // ───── Resizable Problem Panel State ─────
  const DEFAULT_PROBLEM_W = 420;
  const MIN_PROBLEM_W = 320;
  const MAX_PROBLEM_W = 550;
  const [problemWidth, setProblemWidth] = useState(DEFAULT_PROBLEM_W);
  const problemDragRef = useRef(null);

  const mainContainerRef = useRef(null);

  const langMonacoMap = {
    javascript: "javascript",
    python: "python",
    java: "java",
    cpp: "cpp",
  };

  /* ───── Data Fetching (unchanged) ───── */
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

  /* ───── Run & Submit (with AI badge) ───── */
  const handleRun = async () => {
    setIsRunning(true);
    setRunResult(null);
    setActiveTab("console");
    try {
      const res = await fetch(`${API_BASE}/api/code/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, problemId: numericId }),
      });
      const data = await res.json();
      setRunResult(data);
    } catch (e) {
      setRunResult({ status: "FAILED", error: "Failed to connect to judge backend." });
    }
    setIsRunning(false);
  };

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
        body: JSON.stringify({ code, language, problemId: numericId }),
      });
      const data = await res.json();
      setSubmitResult(data);
      // Show AI Review badge if review data is present
      if (data.aiReview) {
        setHasNewAiReview(true);
      }
      if (token) fetchSubmissionsHistory();
    } catch (e) {
      setSubmitResult({ status: "ERROR", error: "Backend server unreachable." });
    }
    setIsSubmitting(false);
  };

  /* ───── Reset Code ───── */
  const handleResetCode = () => {
    const starter = problem?.starterCode ? problem.starterCode[language] : "";
    setCode(starter || "// Write code here\n");
    setShowResetConfirm(false);
  };

  /* ───── Horizontal Resize (Problem ↔ Editor) ───── */
  const handleProblemDragStart = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = problemWidth;

    const onMove = (moveE) => {
      const delta = moveE.clientX - startX;
      const newWidth = Math.min(MAX_PROBLEM_W, Math.max(MIN_PROBLEM_W, startWidth + delta));
      // Also clamp to 45% of viewport width
      const maxVw = window.innerWidth * 0.45;
      setProblemWidth(Math.min(newWidth, maxVw));
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [problemWidth]);

  /* ───── Vertical Resize (Editor ↔ Bottom Panel) ───── */
  const handleBottomDragStart = useCallback((e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = bottomPanelHeight;

    const onMove = (moveE) => {
      const delta = startY - moveE.clientY;
      const maxH = window.innerHeight * 0.6;
      const newHeight = Math.min(maxH, Math.max(MIN_BOTTOM, startHeight + delta));
      setBottomPanelHeight(newHeight);
      setIsBottomCollapsed(false);
      setIsBottomMaximized(false);
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [bottomPanelHeight]);

  const toggleBottomCollapse = () => {
    if (isBottomCollapsed) {
      setIsBottomCollapsed(false);
      setBottomPanelHeight(DEFAULT_BOTTOM);
    } else {
      setIsBottomCollapsed(true);
      setIsBottomMaximized(false);
    }
  };

  const toggleBottomMaximize = () => {
    if (isBottomMaximized) {
      setIsBottomMaximized(false);
      setBottomPanelHeight(DEFAULT_BOTTOM);
    } else {
      setIsBottomMaximized(true);
      setIsBottomCollapsed(false);
      setBottomPanelHeight(window.innerHeight * 0.6);
    }
  };

  const effectiveBottomHeight = isBottomCollapsed ? MIN_BOTTOM : bottomPanelHeight;

  /* ───── Tab button helper ───── */
  const tabBtnClass = (tabId) =>
    `px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium transition-all text-xs ${
      activeTab === tabId
        ? "bg-dark-700 text-white border border-dark-600"
        : "text-gray-400 hover:text-gray-200"
    }`;

  /* ───── Loading State ───── */
  if (loadingProblem || !problem) {
    return (
      <div className="h-screen bg-dark-900 flex items-center justify-center text-gray-400">
        <Loader className="animate-spin mr-2" size={20} /> Loading problem...
      </div>
    );
  }

  return (
    <div className="h-screen bg-dark-900 text-white flex flex-col overflow-hidden" ref={mainContainerRef}>
      {/* ═══════ Header Bar ═══════ */}
      <header className="h-14 bg-dark-800/80 border-b border-dark-700 px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/practice")}
            className="p-1.5 hover:bg-dark-700 rounded-md text-gray-400 hover:text-white transition-colors"
            aria-label="Back to Practice HQ"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Terminal className="text-neon-cyan" size={20} />
            <h1 className="font-orbitron font-bold text-sm text-white">
              CodeLab <span className="text-gray-400 font-normal">| #{problem.id} {problem.title}</span>
            </h1>
          </div>
          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${diffColors[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="flex bg-dark-900 p-1 rounded-md border border-dark-700">
            {["cpp", "java", "python", "javascript"].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1 rounded-md text-xs font-semibold uppercase transition-all ${
                  language === lang
                    ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 shadow-[0_0_8px_#00f3ff44]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {lang === "cpp" ? "C++" : lang}
              </button>
            ))}
          </div>

          {/* Reset Code */}
          <div className="relative">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="p-2 hover:bg-dark-700 rounded-md text-gray-400 hover:text-neon-yellow transition-colors border border-transparent hover:border-dark-600"
              title="Reset code to starter template"
              aria-label="Reset code"
            >
              <RotateCcw size={14} />
            </button>
            {showResetConfirm && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-dark-800 border border-dark-600 rounded-xl p-4 shadow-2xl z-50 animate-fade-in">
                <p className="text-sm font-medium text-white mb-1">Reset Code?</p>
                <p className="text-xs text-gray-400 mb-4">
                  This will replace your current code with the original starter template.
                </p>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1.5 text-xs rounded-md bg-dark-700 text-gray-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetCode}
                    className="px-3 py-1.5 text-xs rounded-md bg-neon-yellow/20 text-neon-yellow border border-neon-yellow/40 hover:bg-neon-yellow/30 transition-colors font-medium"
                  >
                    Reset Code
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Run Tests Button */}
          <button
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-2 bg-dark-700 hover:bg-dark-600 border border-dark-600 text-gray-200 px-4 py-2 rounded-md text-xs font-bold transition-all disabled:opacity-50"
            title="Run executes public test cases only"
          >
            {isRunning ? <Loader size={14} className="animate-spin" /> : <Play size={14} />}
            {isRunning ? "Running..." : "Run Tests"}
          </button>

          {/* Submit Solution Button */}
          <button
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-2 bg-neon-purple hover:bg-neon-purple/80 text-white px-5 py-2 rounded-md text-xs font-bold shadow-[0_0_12px_#b026ff66] transition-all disabled:opacity-50"
            title="Submit evaluates your solution against the complete test suite"
          >
            {isSubmitting ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
            {isSubmitting ? "Judging..." : "Submit Solution"}
          </button>
        </div>
      </header>

      {/* ═══════ Main Split Body ═══════ */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* ─── Left: Problem Description ─── */}
        <div
          className="flex-shrink-0 bg-dark-900 border-r border-dark-700 flex flex-col overflow-y-auto p-5"
          style={{ width: Math.min(problemWidth, window.innerWidth * 0.45) }}
        >
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold font-orbitron text-white mb-2">{problem.title}</h2>
              <div className="flex flex-wrap gap-2 mb-3">
                {problem.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] bg-dark-800 text-gray-300 px-2 py-0.5 rounded-md border border-dark-700 flex items-center gap-1">
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
                <div key={i} className="bg-dark-800/60 border border-dark-700 p-3 rounded-xl space-y-2 font-mono text-xs">
                  <p className="text-neon-cyan font-bold">Example {i + 1}:</p>
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase tracking-wider block mb-0.5">Input</span>
                    <OutputBlock value={ex.input} />
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase tracking-wider block mb-0.5">Output</span>
                    <OutputBlock value={ex.output} />
                  </div>
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

            {/* Hints */}
            <div className="pt-2 border-t border-dark-800">
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-1.5 text-xs font-medium text-neon-yellow hover:underline"
              >
                <Lightbulb size={14} /> {showHint ? "Hide Hint" : "Need a Hint?"}
              </button>
              {showHint && problem.hints && problem.hints.length > 0 && (
                <div className="mt-2 p-3 bg-neon-yellow/10 border border-neon-yellow/30 rounded-xl text-xs text-gray-300 animate-fade-in">
                  💡 {problem.hints[0]}
                </div>
              )}
              {showHint && (!problem.hints || problem.hints.length === 0) && (
                <div className="mt-2 p-3 bg-neon-yellow/10 border border-neon-yellow/30 rounded-xl text-xs text-gray-300 animate-fade-in">
                  💡 Consider edge cases and optimal time complexity for this problem.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Horizontal Drag Handle (Problem ↔ Editor) ─── */}
        <div
          ref={problemDragRef}
          onMouseDown={handleProblemDragStart}
          className="w-1.5 flex-shrink-0 bg-dark-700/50 hover:bg-neon-cyan/30 cursor-col-resize transition-colors relative group"
          aria-label="Resize problem panel"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripHorizontal size={12} className="text-gray-400 rotate-90" />
          </div>
        </div>

        {/* ─── Right: Editor + Bottom Panel ─── */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-dark-950">
          {/* Code Editor — gets remaining space */}
          <div className="flex-1 min-h-[100px] relative">
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

          {/* ─── Vertical Drag Handle (Editor ↔ Bottom Panel) ─── */}
          <div
            ref={bottomDragRef}
            onMouseDown={handleBottomDragStart}
            className="h-1.5 flex-shrink-0 bg-dark-700/50 hover:bg-neon-purple/30 cursor-row-resize transition-colors relative group"
            aria-label="Resize output panel"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripHorizontal size={12} className="text-gray-400" />
            </div>
          </div>

          {/* ═══════ Bottom Panel ═══════ */}
          <div
            className="flex-shrink-0 bg-dark-900 flex flex-col overflow-hidden transition-[height] duration-150"
            style={{ height: effectiveBottomHeight }}
          >
            {/* Panel Tab Bar */}
            <div
              className="flex items-center gap-1 px-3 py-1.5 bg-dark-800/70 border-b border-dark-700 text-xs flex-shrink-0"
              role="tablist"
              aria-label="Output panel tabs"
            >
              <button
                onClick={() => setActiveTab("console")}
                className={tabBtnClass("console")}
                role="tab"
                aria-selected={activeTab === "console"}
              >
                <Terminal size={14} className="text-neon-cyan" /> Console
              </button>

              <button
                onClick={() => setActiveTab("testcases")}
                className={tabBtnClass("testcases")}
                role="tab"
                aria-selected={activeTab === "testcases"}
              >
                <FileText size={14} className="text-neon-green" /> Test Cases
              </button>

              <button
                onClick={() => {
                  setActiveTab("ai");
                  setHasNewAiReview(false);
                }}
                className={`${tabBtnClass("ai")} relative`}
                role="tab"
                aria-selected={activeTab === "ai"}
              >
                <Sparkles size={14} className="text-neon-purple" /> AI Review
                {hasNewAiReview && activeTab !== "ai" && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-neon-purple animate-pulse shadow-[0_0_6px_#b026ff]" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("history")}
                className={tabBtnClass("history")}
                role="tab"
                aria-selected={activeTab === "history"}
              >
                <History size={14} className="text-neon-yellow" /> Submissions ({history.length})
              </button>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Panel controls: collapse / maximize */}
              <button
                onClick={toggleBottomCollapse}
                className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-dark-700 transition-colors"
                aria-label={isBottomCollapsed ? "Expand panel" : "Collapse panel"}
                title={isBottomCollapsed ? "Expand panel" : "Collapse panel"}
              >
                {isBottomCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <button
                onClick={toggleBottomMaximize}
                className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-dark-700 transition-colors"
                aria-label={isBottomMaximized ? "Restore panel" : "Maximize panel"}
                title={isBottomMaximized ? "Restore panel" : "Maximize panel"}
              >
                {isBottomMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            </div>

            {/* Tab Content Area */}
            {!isBottomCollapsed && (
              <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-gray-300 min-h-0" role="tabpanel">
                {/* ══════ CONSOLE TAB ══════ */}
                {activeTab === "console" && (
                  <div>
                    {!runResult && !submitResult && (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Terminal size={32} className="text-gray-600 mb-3" />
                        <p className="text-gray-400 font-sans text-sm">
                          Click <strong className="text-gray-200">Run Tests</strong> to test public cases or{" "}
                          <strong className="text-gray-200">Submit Solution</strong> to run the full judge.
                        </p>
                      </div>
                    )}

                    {/* Submit Verdict */}
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

                        {/* Detailed Test Results — structured cards */}
                        {submitResult.results && (
                          <div className="space-y-3 mt-2">
                            {submitResult.results.map((res, i) => (
                              <TestCaseCard
                                key={i}
                                index={i + 1}
                                passed={res.passed}
                                input={res.input}
                                expected={res.expected}
                                actual={res.actual}
                                testType={res.testType}
                                error={res.error}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Run Verdict */}
                    {runResult && !submitResult && (
                      <div className="space-y-3">
                        <div
                          className={`p-3 rounded-xl border flex items-center justify-between ${
                            runResult.status === "PASSED"
                              ? "bg-neon-green/10 border-neon-green/40 text-neon-green"
                              : "bg-red-500/10 border-red-500/40 text-red-400"
                          }`}
                        >
                          <div className="flex items-center gap-2 font-bold font-orbitron text-sm">
                            {runResult.status === "PASSED" ? <CheckCircle size={18} /> : <XCircle size={18} />}
                            <span>{runResult.status === "PASSED" ? "Public Test Cases Passed" : "Public Test Case Failed"}</span>
                          </div>
                          <span className="text-gray-400 text-xs font-sans">Runtime: {runResult.totalRuntime || 0} ms</span>
                        </div>

                        {runResult.results &&
                          runResult.results.map((r, idx) => (
                            <TestCaseCard
                              key={idx}
                              index={r.testCaseIndex || idx + 1}
                              passed={r.passed !== false && !r.error}
                              input={r.input}
                              expected={r.expected}
                              actual={r.actual}
                              error={r.error}
                            />
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ══════ TEST CASES TAB ══════ */}
                {activeTab === "testcases" && (
                  <div className="space-y-3">
                    {problem.examples.map((ex, idx) => (
                      <div key={idx} className="bg-dark-800/60 border border-dark-700 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-dark-700 bg-dark-800/80">
                          <span className="text-xs font-medium text-neon-cyan flex items-center gap-1.5">
                            <FileText size={12} /> Public Case #{idx + 1}
                          </span>
                        </div>
                        <div className="px-3 py-2.5 space-y-2">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium block mb-1">Input</span>
                            <OutputBlock value={ex.input} />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium block mb-1">Expected Output</span>
                            <OutputBlock value={ex.output} />
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="p-3 bg-dark-800/40 border border-dark-700 rounded-xl text-gray-400 font-sans text-xs flex items-center gap-2">
                      <AlertTriangle size={14} className="text-gray-500 flex-shrink-0" />
                      Additional hidden, edge, and stress cases are executed automatically upon full submission.
                    </div>
                  </div>
                )}

                {/* ══════ AI REVIEW TAB ══════ */}
                {activeTab === "ai" && (
                  <div>
                    {submitResult && submitResult.aiReview ? (
                      <div className="space-y-3 font-sans">
                        <div className="p-4 bg-neon-purple/10 border border-neon-purple/30 rounded-xl space-y-3">
                          <p className="font-bold text-neon-purple text-sm flex items-center gap-1.5">
                            <Sparkles size={16} /> CodeForge AI Review
                          </p>
                          <p className="text-gray-300 text-xs leading-relaxed">{submitResult.aiReview.correctness}</p>
                          <p className="text-gray-300 text-xs">
                            <strong className="text-gray-200">Optimization:</strong> {submitResult.aiReview.optimization}
                          </p>
                          <p className="text-gray-300 text-xs">
                            <strong className="text-gray-200">Estimated Complexity:</strong> {submitResult.aiReview.estimatedComplexity}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Sparkles size={32} className="text-gray-600 mb-3" />
                        <p className="text-gray-400 font-sans text-sm">
                          Submit your code to generate instant AI code quality and complexity review.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* ══════ SUBMISSIONS TAB ══════ */}
                {activeTab === "history" && (
                  <div className="space-y-2 font-sans">
                    {history.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <History size={32} className="text-gray-600 mb-3" />
                        <p className="text-gray-400 text-sm">No past submissions found for this problem.</p>
                      </div>
                    ) : (
                      history.map((sub, i) => (
                        <div
                          key={i}
                          className="p-3 bg-dark-800 rounded-xl border border-dark-700 flex items-center justify-between text-xs"
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
                          <span className="text-gray-400 text-[11px]">
                            {new Date(sub.createdAt).toLocaleDateString()} {new Date(sub.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click-away overlay for reset confirm */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-40" onClick={() => setShowResetConfirm(false)} />
      )}
    </div>
  );
}
