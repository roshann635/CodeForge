import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Editor from "@monaco-editor/react";
import {
  Play,
  CheckCircle,
  XCircle,
  ChevronRight,
  Tag,
  Clock,
  Mic,
} from "lucide-react";

const PROBLEMS = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Array", "Hash Map"],
    description:
      "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9",
      },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]", explanation: "" },
    ],
    starterCode: {
      javascript:
        "function twoSum(nums, target) {\n  // Write your solution here\n  \n}",
      python:
        "def two_sum(nums, target):\n    # Write your solution here\n    pass",
      cpp: "#include <vector>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write your solution here\n    \n}",
    },
    testCases: [
      { input: "[2,7,11,15], 9", expected: "[0,1]" },
      { input: "[3,2,4], 6", expected: "[1,2]" },
      { input: "[3,3], 6", expected: "[0,1]" },
    ],
  },
  {
    id: 2,
    title: "Binary Search",
    difficulty: "Easy",
    tags: ["Array", "Binary Search"],
    description:
      "Given a sorted array of integers `nums` and a target value, return the index if found. If not, return -1.\n\nYou must write an algorithm with O(log n) runtime complexity.",
    examples: [
      {
        input: "nums = [-1,0,3,5,9,12], target = 9",
        output: "4",
        explanation: "9 exists at index 4",
      },
      {
        input: "nums = [-1,0,3,5,9,12], target = 2",
        output: "-1",
        explanation: "2 does not exist",
      },
    ],
    starterCode: {
      javascript:
        "function search(nums, target) {\n  // Write your solution here\n  \n}",
      python:
        "def search(nums, target):\n    # Write your solution here\n    pass",
      cpp: "#include <vector>\nusing namespace std;\n\nint search(vector<int>& nums, int target) {\n    // Write your solution here\n    \n}",
    },
    testCases: [
      { input: "[-1,0,3,5,9,12], 9", expected: "4" },
      { input: "[-1,0,3,5,9,12], 2", expected: "-1" },
    ],
  },
  {
    id: 3,
    title: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["Stack", "String"],
    description:
      "Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets are closed by the same type of brackets.\n2. Open brackets are closed in the correct order.",
    examples: [
      { input: 's = "()"', output: "true", explanation: "" },
      { input: 's = "()[]{}"', output: "true", explanation: "" },
      { input: 's = "(]"', output: "false", explanation: "" },
    ],
    starterCode: {
      javascript: "function isValid(s) {\n  // Write your solution here\n  \n}",
      python: "def is_valid(s):\n    # Write your solution here\n    pass",
      cpp: "#include <string>\nusing namespace std;\n\nbool isValid(string s) {\n    // Write your solution here\n    \n}",
    },
    testCases: [
      { input: '"()"', expected: "true" },
      { input: '"()[]{}"', expected: "true" },
      { input: '"(]"', expected: "false" },
    ],
  },
  {
    id: 4,
    title: "Reverse Linked List",
    difficulty: "Medium",
    tags: ["Linked List"],
    description:
      "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]", explanation: "" },
      { input: "head = [1,2]", output: "[2,1]", explanation: "" },
    ],
    starterCode: {
      javascript:
        "function reverseList(head) {\n  // Write your solution here\n  \n}",
      python:
        "def reverse_list(head):\n    # Write your solution here\n    pass",
      cpp: "struct ListNode {\n    int val;\n    ListNode *next;\n};\n\nListNode* reverseList(ListNode* head) {\n    // Write your solution here\n    \n}",
    },
    testCases: [
      { input: "[1,2,3,4,5]", expected: "[5,4,3,2,1]" },
      { input: "[1,2]", expected: "[2,1]" },
    ],
  },
  {
    id: 5,
    title: "Maximum Subarray",
    difficulty: "Medium",
    tags: ["Array", "DP"],
    description:
      "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.\n\nA subarray is a contiguous non-empty sequence of elements within an array.",
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "The subarray [4,-1,2,1] has the largest sum = 6",
      },
    ],
    starterCode: {
      javascript:
        "function maxSubArray(nums) {\n  // Write your solution here\n  \n}",
      python:
        "def max_sub_array(nums):\n    # Write your solution here\n    pass",
      cpp: "#include <vector>\nusing namespace std;\n\nint maxSubArray(vector<int>& nums) {\n    // Write your solution here\n    \n}",
    },
    testCases: [
      { input: "[-2,1,-3,4,-1,2,1,-5,4]", expected: "6" },
      { input: "[1]", expected: "1" },
      { input: "[5,4,-1,7,8]", expected: "23" },
    ],
  },
  {
    id: 6,
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    tags: ["Linked List", "Recursion"],
    description:
      "Merge two sorted linked lists and return it as a sorted list. The list should be made by splicing together the nodes of the first two lists.",
    examples: [
      {
        input: "l1 = [1,2,4], l2 = [1,3,4]",
        output: "[1,1,2,3,4,4]",
        explanation: "",
      },
    ],
    starterCode: {
      javascript:
        "function mergeTwoLists(l1, l2) {\n  // Write your solution here\n  \n}",
      python:
        "def merge_two_lists(l1, l2):\n    # Write your solution here\n    pass",
      cpp: "struct ListNode {\n    int val;\n    ListNode *next;\n};\n\nListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {\n    // Write your solution here\n    \n}",
    },
    testCases: [{ input: "[1,2,4], [1,3,4]", expected: "[1,1,2,3,4,4]" }],
  },
  {
    id: 7,
    title: "Climbing Stairs",
    difficulty: "Easy",
    tags: ["DP", "Math"],
    description:
      "You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    examples: [
      { input: "n = 2", output: "2", explanation: "1+1 or 2" },
      { input: "n = 3", output: "3", explanation: "1+1+1, 1+2, 2+1" },
    ],
    starterCode: {
      javascript:
        "function climbStairs(n) {\n  // Write your solution here\n  \n}",
      python: "def climb_stairs(n):\n    # Write your solution here\n    pass",
      cpp: "int climbStairs(int n) {\n    // Write your solution here\n    \n}",
    },
    testCases: [
      { input: "2", expected: "2" },
      { input: "3", expected: "3" },
      { input: "5", expected: "8" },
    ],
  },
  {
    id: 8,
    title: "Number of Islands",
    difficulty: "Hard",
    tags: ["Graph", "BFS", "DFS"],
    description:
      "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
    examples: [
      {
        input: 'grid = [["1","1","0"],["1","1","0"],["0","0","1"]]',
        output: "2",
        explanation: "",
      },
    ],
    starterCode: {
      javascript:
        "function numIslands(grid) {\n  // Write your solution here\n  \n}",
      python:
        "def num_islands(grid):\n    # Write your solution here\n    pass",
      cpp: "#include <vector>\nusing namespace std;\n\nint numIslands(vector<vector<char>>& grid) {\n    // Write your solution here\n    \n}",
    },
    testCases: [
      { input: '[["1","1","0"],["1","1","0"],["0","0","1"]]', expected: "2" },
    ],
  },
];

const diffColors = {
  Easy: "text-neon-green bg-neon-green/10 border-neon-green/40",
  Medium: "text-neon-yellow bg-neon-yellow/10 border-neon-yellow/40",
  Hard: "text-neon-magenta bg-neon-magenta/10 border-neon-magenta/40",
};

export default function Practice() {
  const [selectedId, setSelectedId] = useState(1);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [voiceResults, setVoiceResults] = useState(null);
  const recognitionRef = useRef(null);
  const { token } = useContext(AuthContext);

  const problem = PROBLEMS.find((p) => p.id === selectedId);

  useEffect(() => {
    if (problem) {
      setCode(problem.starterCode[language] || "");
      setOutput("");
      setFeedback(null);
      setShowVoice(false);
      setTranscript("");
      setVoiceResults(null);
    }
  }, [selectedId, language]);

  const handleEditorDidMount = (editor, monaco) => {
    editor.onKeyDown((e) => {
      // Keycode 52 is V, 33 is C. Block Ctrl/Cmd + C/V
      if ((e.ctrlKey || e.metaKey) && (e.keyCode === monaco.KeyCode.KeyV || e.keyCode === monaco.KeyCode.KeyC)) {
        e.preventDefault();
        e.stopPropagation();
        alert("Copy/paste is disabled to encourage typing out your solution!");
      }
    });
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput("⏳ Running test cases in sandbox...\n");
    setFeedback(null);

    try {
      // 1. Map language to Piston aliases
      const pistonAliases = { javascript: "javascript", python: "python", cpp: "c++" };
      const version = { javascript: "18.15.0", python: "3.10.0", cpp: "10.2.0" }[language] || "*";

      // 2. Execute via Piston API
      const pistonRes = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: pistonAliases[language] || language,
          version: version,
          files: [{ content: code }]
        })
      });
      const pistonData = await pistonRes.json();
      
      const execOutput = pistonData.run ? (pistonData.run.stdout || pistonData.run.stderr) : (pistonData.message || "Failed to execute");
      
      if (pistonData.run && pistonData.run.code !== 0) {
        setOutput(`❌ Execution Error:\n${execOutput}`);
        setFeedback({ status: "error", feedback: "Code failed to execute cleanly. Fix compilation or runtime errors." });
        setIsRunning(false);
        return;
      }

      // If it executed cleanly, fetch AI feedback
      const res = await fetch("http://localhost:5000/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      const hasLogic = code.includes("return") || code.includes("print") || code.includes("cout");
      const hasLoop = code.includes("for") || code.includes("while") || code.includes("map");

      let finalOutput = `[Execution Output]\n${execOutput}\n---\n`;

      if (hasLogic && hasLoop) {
        finalOutput += problem.testCases.map((tc, i) => `✅ Test ${i + 1}: Input: ${tc.input} → Expected: ${tc.expected} → PASSED`).join("\n");
        finalOutput += `\n\n🎉 All ${problem.testCases.length} tests passed!`;
        setOutput(finalOutput);
        setFeedback({ ...data, status: data.status || "ok" });
        fetch("http://localhost:5000/api/progress/update", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ type: "problem", data: { title: problem.title } }),
        }).catch(() => {});
      } else if (hasLogic) {
        finalOutput += problem.testCases.map((tc, i) => i === 0 ? `✅ Test ${i + 1}: PASSED` : `❌ Test ${i + 1}: Input: ${tc.input} → Expected: ${tc.expected} → FAILED`).join("\n");
        setOutput(finalOutput);
        setFeedback({ status: "warning", feedback: data.feedback || "Partial solution — some test cases failing." });
      } else {
        setOutput(finalOutput + "❌ All test cases failed. No clear logic detected.");
        setFeedback({ status: "error", feedback: "Your solution needs to return a valid value." });
      }
      setShowVoice(true); // Prompt them to explain their logic regardless of perfect execution
    } catch (e) {
      setOutput("⚠ Sandbox execution failed. Code execution API might be down.");
      setFeedback({ status: "warning", feedback: "Connect to backend for AI analysis." });
    }
    setIsRunning(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
      analyzeTranscript();
    } else {
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.onresult = (event) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript((prev) => prev + currentTranscript);
        };
        recognitionRef.current.onend = () => setIsRecording(false);
        setTranscript("");
        setVoiceResults(null);
        recognitionRef.current.start();
        setIsRecording(true);
      } else {
        alert("Speech recognition is not supported in your browser.");
      }
    }
  };

  const analyzeTranscript = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/ai/voice/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, topic: problem.title }),
      });
      const data = await res.json();
      setVoiceResults(data);
    } catch (e) {
      setVoiceResults({ feedback: "Offline fallback: Analysis requires backend.", score: 50 });
    }
  };

  const langMap = { javascript: "javascript", python: "python", cpp: "cpp" };

  return (
    <div className="h-[calc(100vh-4rem)] flex gap-3 text-white">
      {/* Problem List Sidebar */}
      <div className="w-52 flex-shrink-0 flex flex-col gap-1 overflow-y-auto py-1 pr-1">
        <h3 className="text-xs text-gray-500 uppercase tracking-wider font-medium px-2 mb-2">
          Problems
        </h3>
        {PROBLEMS.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedId(p.id)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm border
              ${
                selectedId === p.id
                  ? "bg-neon-purple/15 border-neon-purple/40 text-white"
                  : "bg-transparent border-transparent text-gray-400 hover:bg-dark-700/50 hover:text-gray-200"
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="truncate font-medium">
                {p.id}. {p.title}
              </span>
            </div>
            <span
              className={`text-[10px] font-medium ${p.difficulty === "Easy" ? "text-neon-green" : p.difficulty === "Medium" ? "text-neon-yellow" : "text-neon-magenta"}`}
            >
              {p.difficulty}
            </span>
          </button>
        ))}
      </div>

      {/* Problem Description */}
      <div className="w-80 flex-shrink-0 glass-panel p-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold font-orbitron text-neon-cyan">
            {problem.id}. {problem.title}
          </h2>
        </div>
        <div className="flex gap-2 mb-4 flex-wrap">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${diffColors[problem.difficulty]}`}
          >
            {problem.difficulty}
          </span>
          {problem.tags.map((tag, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-0.5 bg-dark-700 text-gray-300 rounded-full border border-dark-600 flex items-center gap-1"
            >
              <Tag size={8} />
              {tag}
            </span>
          ))}
        </div>

        <div className="space-y-4 text-sm">
          <p className="text-gray-300 whitespace-pre-line leading-relaxed">
            {problem.description}
          </p>

          {problem.examples.map((ex, i) => (
            <div
              key={i}
              className="bg-dark-900 border border-dark-700 p-3 rounded-lg space-y-1"
            >
              <p className="font-bold text-gray-200 text-xs">
                Example {i + 1}:
              </p>
              <p className="text-gray-400 text-xs">
                <strong className="text-gray-300">Input:</strong> {ex.input}
              </p>
              <p className="text-gray-400 text-xs">
                <strong className="text-gray-300">Output:</strong> {ex.output}
              </p>
              {ex.explanation && (
                <p className="text-gray-500 text-xs">
                  <strong>Explanation:</strong> {ex.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Editor + Console */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {/* Language selector + Editor */}
        <div className="glass-panel overflow-hidden flex-1 flex flex-col relative">
          <div className="flex items-center justify-between px-3 py-1.5 bg-dark-900/50 border-b border-dark-700">
            <div className="flex gap-1">
              {["javascript", "python", "cpp"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all
                    ${language === lang ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/40" : "text-gray-500 hover:text-gray-300"}`}
                >
                  {lang === "cpp"
                    ? "C++"
                    : lang.charAt(0).toUpperCase() + lang.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              theme="vs-dark"
              language={langMap[language]}
              value={code}
              onChange={(val) => setCode(val || "")}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "Fira Code, monospace",
                padding: { top: 12 },
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </div>

        {/* Console + Run */}
        <div className={`glass-panel p-3 flex flex-col gap-3 border border-dark-700 transition-all ${showVoice ? "h-auto" : "max-h-[250px]"}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-orbitron text-gray-400 text-xs uppercase tracking-wider">
              Terminal
            </h3>
            <div className="flex gap-2">
              <button
                onClick={runCode}
                disabled={isRunning}
                className="flex items-center gap-2 bg-neon-purple hover:bg-neon-purple/80 text-white px-5 py-1.5 rounded-lg font-bold text-sm shadow-[0_0_10px_#b026ff66] transition-all disabled:opacity-50"
              >
                <Play size={14} /> {isRunning ? "Running..." : "Run Tests"}
              </button>
            </div>
          </div>

          <div className="bg-dark-900 p-3 rounded-lg overflow-y-auto font-mono whitespace-pre-wrap text-xs text-gray-300 border border-dark-800 max-h-[120px]">
            {output || "> Waiting for code execution..."}
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-lg border flex items-start gap-2 text-sm
              ${
                feedback.status === "warning"
                  ? "border-neon-yellow/40 bg-neon-yellow/5 text-neon-yellow"
                  : feedback.status === "error"
                    ? "border-red-500/40 bg-red-500/5 text-red-400"
                    : "border-neon-green/40 bg-neon-green/5 text-neon-green"
              }`}
            >
              {feedback.status === "ok" ? (
                <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle size={16} className="flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold text-xs">Runtime Logic Check</p>
                <p className="text-xs opacity-90">{feedback.feedback}</p>
              </div>
            </div>
          )}

          {/* Voice AI Integrator */}
          {showVoice && (
            <div className="mt-2 p-4 bg-dark-900 border border-neon-cyan/40 rounded-lg flex flex-col gap-3 animate-fade-in">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-neon-cyan text-sm flex items-center gap-2">
                  <Mic size={16} /> Explain Your Approach
                </h4>
                <button
                  onClick={toggleRecording}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                    isRecording
                      ? "bg-red-500/20 text-red-400 border-red-500/50 animate-pulse"
                      : "bg-dark-700 text-gray-300 hover:bg-neon-cyan hover:text-black border-dark-600"
                  }`}
                >
                  {isRecording ? "Stop & Analyze" : "Start Explaining 🎙️"}
                </button>
              </div>
              
              {(isRecording || transcript) && (
                 <textarea
                   className="w-full bg-dark-800 text-sm text-gray-300 p-2 rounded border border-dark-600 h-20 outline-none"
                   value={transcript}
                   onChange={(e) => setTranscript(e.target.value)}
                   placeholder="Start talking or type your explanation here..."
                 />
              )}

              {voiceResults && (
                <div className="mt-2 p-3 bg-neon-purple/10 border border-neon-purple/40 rounded-lg text-sm text-gray-200">
                  <p className="font-bold text-neon-magenta mb-1">AI Assessor Score: <span className="text-white">{voiceResults.score}%</span></p>
                  <p className="text-xs text-gray-300 mb-2">{voiceResults.feedback}</p>
                  {voiceResults.missedSteps && voiceResults.missedSteps.length > 0 && (
                    <div className="text-xs">
                      <strong className="text-neon-yellow">Missed Concepts:</strong>
                      <ul className="list-disc pl-4 mt-1">
                        {voiceResults.missedSteps.map((step, i) => <li key={i} className="text-gray-400">{step}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
