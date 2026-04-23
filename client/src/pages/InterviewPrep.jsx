import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import VoicePanel from "../components/VoicePanel";
import ProctoringPanel from "../components/ProctoringPanel";
import {
  Play,
  Send,
  CheckCircle,
  Code,
  MessageSquare,
  Zap,
  Activity,
  ShieldAlert,
  Cpu,
  Award,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";

const QUESTIONS = {
  "Binary Search": {
    title: "Binary Search",
    description:
      "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.",
    exampleInput: "nums = [-1,0,3,5,9,12], target = 9",
    exampleOutput: "4",
    constraints: [
      "1 <= nums.length <= 10^4",
      "All the integers in `nums` are unique.",
    ],
  },
  "Bubble Sort": {
    title: "Bubble Sort",
    description:
      "Write a function that takes an array of integers and returns a sorted array using the Bubble Sort algorithm.",
    exampleInput: "nums = [5, 2, 9, 1, 5, 6]",
    exampleOutput: "[1, 2, 5, 5, 6, 9]",
    constraints: ["1 <= nums.length <= 10^4"],
  },
  "Merge Sort": {
    title: "Merge Sort",
    description:
      "Implement the Merge Sort algorithm to sort an array of integers in ascending order. You must solve it in O(n log n) time.",
    exampleInput: "nums = [12, 11, 13, 5, 6, 7]",
    exampleOutput: "[5, 6, 7, 11, 12, 13]",
    constraints: ["1 <= nums.length <= 5*10^4"],
  },
  "Quick Sort": {
    title: "Quick Sort",
    description:
      "Implement the Quick Sort algorithm. Pick an element as a pivot and partition the given array around the picked pivot.",
    exampleInput: "nums = [10, 7, 8, 9, 1, 5]",
    exampleOutput: "[1, 5, 7, 8, 9, 10]",
    constraints: ["1 <= nums.length <= 5*10^4"],
  },
  BFS: {
    title: "Breadth-First Search",
    description:
      "Implement BFS to traverse a graph. Given an adjacency list and a starting node, return the sequence of visited nodes.",
    exampleInput: "graph = {0: [1,2], 1: [2], 2: [0,3], 3: [3]}, start = 2",
    exampleOutput: "[2, 0, 3, 1]",
    constraints: ["0 <= V <= 100", "0 <= E <= 10^4"],
  },
  DFS: {
    title: "Depth-First Search",
    description:
      "Implement DFS to traverse a graph. Given an adjacency list and a starting node, return the sequence of visited nodes.",
    exampleInput: "graph = {0: [1,2], 1: [2], 2: [0,3], 3: [3]}, start = 2",
    exampleOutput: "[2, 0, 1, 3] (Depends on edge traversal order)",
    constraints: ["0 <= V <= 100", "0 <= E <= 10^4"],
  },
  "Hash Map": {
    title: "Two Sum (Hash Map)",
    description:
      "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You must solve it using a Hash Map.",
    exampleInput: "nums = [2,7,11,15], target = 9",
    exampleOutput: "[0, 1]",
    constraints: ["2 <= nums.length <= 10^4", "Only one valid answer exists."],
  },
  "Two Pointers": {
    title: "Valid Palindrome",
    description:
      "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.",
    exampleInput: 's = "A man, a plan, a canal: Panama"',
    exampleOutput: "true",
    constraints: ["1 <= s.length <= 2 * 10^5"],
  },
};

export default function InterviewPrep() {
  const [topic, setTopic] = useState("Binary Search");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Write your solution here\n");
  const [transcript, setTranscript] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [proctorActive, setProctorActive] = useState(true);
  const [integrityScore, setIntegrityScore] = useState(100);
  const [violationLog, setViolationLog] = useState([]);
  const [tabSwitchWarning, setTabSwitchWarning] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  // Timer logic
  const [thinkingTime, setThinkingTime] = useState(0);
  const [isThinking, setIsThinking] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (isThinking) {
        setThinkingTime((prev) => prev + 1000);
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isThinking]);

  // Tab switch blocking — show warning overlay when user switches tabs
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
        setTabSwitchWarning(true);
      }
    };

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue =
        "You are in an active interview session. Are you sure you want to leave?";
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handleEditorChange = (value) => {
    setCode(value);
    if (isThinking) setIsThinking(false);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setIsThinking(false);
    try {
      const resp = await fetch("/api/interview/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          topic,
          code,
          thinkingTime,
          language,
        }),
      });
      const data = await resp.json();

      // Adjust final score based on proctoring integrity
      const adjustedData = {
        ...data,
        integrityScore,
        tabSwitches: tabSwitchCount,
        violationCount: violationLog.length,
        // Deduct from final score based on malpractice
        adjustedFinalScore: Math.max(
          0,
          Math.round(data.finalScore * (integrityScore / 100)),
        ),
      };
      setResult(adjustedData);

      const history = JSON.parse(
        localStorage.getItem("interview_history") || "[]",
      );
      history.push({
        topic,
        finalScore: adjustedData.adjustedFinalScore,
        rawScore: data.finalScore,
        integrityScore,
        tabSwitches: tabSwitchCount,
        violations: violationLog.length,
        thinkingTime,
        date: new Date().toISOString(),
      });
      localStorage.setItem("interview_history", JSON.stringify(history));
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleViolation = (violation) => {
    setViolationLog((prev) => [...prev, violation]);
  };

  const getColor = (score) => {
    if (score < 40) return "text-red-500";
    if (score < 70) return "text-yellow-500";
    return "text-neon-green";
  };
  const getBgColor = (score) => {
    if (score < 40) return "bg-red-500/10 border-red-500/50";
    if (score < 70) return "bg-yellow-500/10 border-yellow-500/50";
    return "bg-neon-green/10 border-neon-green/50";
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-3 text-white p-2 relative">
      {/* Tab Switch Warning Overlay */}
      {tabSwitchWarning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setTabSwitchWarning(false)}
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-dark-800 border-2 border-red-500/60 rounded-2xl p-8 max-w-md text-center shadow-[0_0_60px_rgba(239,68,68,0.3)]"
          >
            <AlertTriangle size={64} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-orbitron font-bold text-red-400 mb-3">
              ⚠️ TAB SWITCH DETECTED
            </h2>
            <p className="text-gray-300 mb-2 text-sm">
              Switching tabs during an interview is a{" "}
              <strong className="text-red-400">serious violation</strong>.
            </p>
            <p className="text-gray-500 text-xs mb-4">
              This has been logged. Total tab switches:{" "}
              <span className="text-red-400 font-bold">{tabSwitchCount}</span>
            </p>
            <div className="bg-red-500/10 border border-red-500/40 rounded-lg p-3 mb-4">
              <p className="text-red-300 text-xs font-mono">
                Integrity Impact:{" "}
                <span className="font-bold">-5 points per switch</span>
              </p>
            </div>
            <button
              onClick={() => setTabSwitchWarning(false)}
              className="px-6 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-xl font-bold font-orbitron text-sm hover:bg-red-500/30 transition-all"
            >
              RETURN TO INTERVIEW
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple text-glow-cyan">
            Interview Prep Sim
          </h2>
          <select
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              setResult(null);
              setCode("// Write your solution here\n");
              setThinkingTime(0);
              setIsThinking(true);
            }}
            className="bg-dark-800 border border-dark-600 text-white px-3 py-1.5 rounded text-sm font-mono focus:border-neon-cyan outline-none transition-colors"
          >
            {Object.keys(QUESTIONS).map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-dark-800 border border-dark-600 text-white px-3 py-1.5 rounded text-sm font-mono focus:border-neon-purple outline-none transition-colors"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <Shield
              size={14}
              className={
                integrityScore >= 80
                  ? "text-neon-green"
                  : integrityScore >= 50
                    ? "text-neon-yellow"
                    : "text-red-400"
              }
            />
            <span
              className={`text-sm font-mono font-bold ${integrityScore >= 80 ? "text-neon-green" : integrityScore >= 50 ? "text-neon-yellow" : "text-red-400"}`}
            >
              {integrityScore}%
            </span>
          </div>
          {tabSwitchCount > 0 && (
            <span className="text-xs text-red-400 font-mono flex items-center gap-1">
              <AlertTriangle size={12} /> {tabSwitchCount} tab switch
              {tabSwitchCount !== 1 ? "es" : ""}
            </span>
          )}
          <span className="text-sm font-mono text-gray-400">
            Thinking: {(thinkingTime / 1000).toFixed(0)}s
          </span>
        </div>
      </div>

      {/* Main Grid — 4 columns: Problem | Editor | Voice | Proctor */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-3 min-h-0">
        {/* Left Panel: Problem Statement */}
        <div className="glass-panel p-4 border border-dark-600 flex flex-col overflow-y-auto">
          <h3 className="text-lg font-bold font-orbitron text-neon-cyan mb-3">
            {QUESTIONS[topic].title}
          </h3>
          <p className="text-gray-300 text-sm mb-3 leading-relaxed font-mono">
            {QUESTIONS[topic].description}
          </p>
          <div className="bg-dark-900 border border-dark-700 p-3 rounded mb-3">
            <p className="text-xs font-mono text-gray-400">Example</p>
            <p className="text-sm text-neon-yellow mt-1">
              Input: {QUESTIONS[topic].exampleInput}
            </p>
            <p className="text-sm text-neon-yellow">
              Output: {QUESTIONS[topic].exampleOutput}
            </p>
          </div>
          <div className="bg-dark-900 border border-dark-700 p-3 rounded">
            <p className="text-xs font-mono text-gray-400">Constraints</p>
            <ul className="text-sm text-gray-400 list-disc pl-4 mt-1">
              {QUESTIONS[topic].constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Center Panel: Editor */}
        <div className="glass-panel border border-dark-600 flex flex-col relative overflow-hidden group lg:col-span-2">
          <div className="flex justify-between items-center p-2 bg-dark-800 border-b border-dark-600">
            <span className="text-xs font-bold font-orbitron text-gray-400 flex items-center gap-2">
              <Code size={14} /> SOLUTION IDE
            </span>
            <div className="flex gap-2">
              <button
                className="bg-dark-700 hover:bg-dark-600 p-1.5 rounded transition-colors"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                <Play size={14} className="text-neon-cyan" />
              </button>
              <button
                className="bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan p-1.5 rounded transition-colors flex items-center gap-1 text-xs font-bold font-orbitron"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                <Send size={14} /> SUBMIT
              </button>
            </div>
          </div>

          <div
            className="flex-1 w-full"
            onPaste={(e) => {
              e.preventDefault();
              alert("Pasting strictly restricted in Interview Mode.");
            }}
            onCopy={(e) => {
              e.preventDefault();
              alert("Copying strictly restricted in Interview Mode.");
            }}
          >
            <Editor
              height="100%"
              language={language === "cpp" ? "cpp" : language}
              value={code}
              theme="vs-dark"
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "Fira Code, monospace",
              }}
            />
          </div>

          {/* Evaluation Results — below editor */}
          {result && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="bg-dark-900/95 border-t border-dark-600 p-3 overflow-y-auto max-h-[280px]"
            >
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-dark-700">
                <h3 className="font-orbitron font-bold text-gray-200 text-sm">
                  Evaluation Report
                </h3>
                <div className="flex gap-3 items-center">
                  <div
                    className={`px-2 py-1 rounded border text-xs font-bold ${getBgColor(result.adjustedFinalScore)} ${getColor(result.adjustedFinalScore)}`}
                  >
                    Adjusted: {result.adjustedFinalScore}/100
                  </div>
                  <div
                    className={`px-2 py-1 rounded border text-xs ${getBgColor(result.finalScore)} ${getColor(result.finalScore)}`}
                  >
                    Raw: {result.finalScore}
                  </div>
                  <div
                    className={`px-2 py-1 rounded border text-xs ${getBgColor(integrityScore)} ${getColor(integrityScore)}`}
                  >
                    <Shield size={10} className="inline mr-1" />
                    Integrity: {integrityScore}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  { label: "Code", val: result.codeScore, icon: Code },
                  { label: "Logic", val: result.logicScore, icon: Activity },
                  {
                    label: "Comm.",
                    val: result.communicationScore,
                    icon: MessageSquare,
                  },
                  { label: "Speed", val: result.speedScore, icon: Zap },
                  { label: "Edge", val: result.edgeScore, icon: ShieldAlert },
                  { label: "Pattern", val: result.patternScore, icon: Cpu },
                  {
                    label: "Confidence",
                    val: result.confidenceScore,
                    icon: Award,
                  },
                  { label: "DSA", val: result.dsaScore, icon: Activity },
                ].map(({ label, val, icon: Icon }, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded border text-center ${getBgColor(val)}`}
                  >
                    <Icon
                      size={12}
                      className={`mx-auto mb-0.5 ${getColor(val)}`}
                    />
                    <p className="text-[9px] text-gray-500 font-mono">
                      {label}
                    </p>
                    <p className={`font-bold text-sm ${getColor(val)}`}>
                      {val}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-dark-800 border border-dark-700 p-3 rounded text-xs text-gray-300 font-mono mb-2 leading-relaxed">
                <strong className="text-neon-cyan block mb-1">
                  AI VERDICT:
                </strong>
                {result.feedback}
              </div>

              {result.followUpQuestion && (
                <div className="bg-neon-purple/5 border border-neon-purple/40 p-3 rounded text-xs text-neon-purple font-mono leading-relaxed">
                  <strong className="block mb-1">💬 Follow-Up:</strong>
                  {result.followUpQuestion}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Right Panel: Voice + Proctoring stacked */}
        <div className="flex flex-col gap-3 min-h-0 overflow-hidden">
          <div className="flex-shrink-0 min-h-[180px] max-h-[240px]">
            <VoicePanel
              transcript={transcript}
              setTranscript={setTranscript}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
            />
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <ProctoringPanel
              isActive={proctorActive}
              onViolation={handleViolation}
              onScoreUpdate={setIntegrityScore}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
