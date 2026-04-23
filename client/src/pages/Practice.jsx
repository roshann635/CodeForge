import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Editor from "@monaco-editor/react";
import CodeReviewPanel from "../components/CodeReviewPanel";
import API_BASE from "../config/api";
import {
  Play,
  CheckCircle,
  XCircle,
  Send,
  Tag,
  Mic,
  Loader,
  Clock,
  Cpu,
  Zap,
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
      java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}",
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
      java: "class Solution {\n    public int search(int[] nums, int target) {\n        // Write your solution here\n        return -1;\n    }\n}",
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
      "Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.",
    examples: [
      { input: 's = "()"', output: "true", explanation: "" },
      { input: 's = "(]"', output: "false", explanation: "" },
    ],
    starterCode: {
      javascript: "function isValid(s) {\n  // Write your solution here\n  \n}",
      python: "def is_valid(s):\n    # Write your solution here\n    pass",
      java: "class Solution {\n    public boolean isValid(String s) {\n        // Write your solution here\n        return false;\n    }\n}",
      cpp: "#include <string>\nusing namespace std;\n\nbool isValid(string s) {\n    // Write your solution here\n    \n}",
    },
    testCases: [
      { input: '"()"', expected: "true" },
      { input: '"()[]{}\"', expected: "true" },
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
    ],
    starterCode: {
      javascript:
        "function reverseList(head) {\n  // Write your solution here\n  \n}",
      python:
        "def reverse_list(head):\n    # Write your solution here\n    pass",
      java: "class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Write your solution here\n        return null;\n    }\n}",
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
      "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
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
      java: "class Solution {\n    public int maxSubArray(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n}",
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
      "Merge two sorted linked lists and return it as a sorted list.",
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
      java: "class Solution {\n    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {\n        return null;\n    }\n}",
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
      java: "class Solution {\n    public int climbStairs(int n) {\n        return 0;\n    }\n}",
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
      "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.",
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
      java: "class Solution {\n    public int numIslands(char[][] grid) {\n        return 0;\n    }\n}",
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
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [voiceResults, setVoiceResults] = useState(null);
  const [codeReview, setCodeReview] = useState(null);
  const [speechData, setSpeechData] = useState(null);
  const recognitionRef = useRef(null);
  const { token } = useContext(AuthContext);

  const problem = PROBLEMS.find((p) => p.id === selectedId);
  const langMap = {
    javascript: "javascript",
    python: "python",
    java: "java",
    cpp: "cpp",
  };
  const LANGS = ["javascript", "python", "java", "cpp"];

  useEffect(() => {
    if (problem) {
      setCode(problem.starterCode[language] || "");
      setResults(null);
      setShowVoice(false);
      setTranscript("");
      setVoiceResults(null);
    }
  }, [selectedId, language]);

  // Run against first test case only (quick check)
  const runCode = async () => {
    setIsRunning(true);
    setResults(null);
    try {
      const tc = problem.testCases[0];
      const res = await fetch(`${API_BASE}/api/code/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          problemId: problem.id,
          testCase: tc,
        }),
      });
      const data = await res.json();
      setResults({
        mode: "run",
        status: data.status,
        output: data.output,
        expected: data.expected,
        passed: data.passed,
        runtime: data.runtime,
        error: data.error,
      });
    } catch (e) {
      setResults({
        mode: "run",
        status: "error",
        error: "Backend unreachable. Ensure server is running.",
      });
    }
    setIsRunning(false);
  };

  // Submit against ALL test cases
  const submitCode = async () => {
    setIsSubmitting(true);
    setResults(null);
    try {
      const res = await fetch(`${API_BASE}/api/code/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          problemId: problem.id,
          testCases: problem.testCases,
        }),
      });
      const data = await res.json();
      setResults({ mode: "submit", ...data });

      // Fetch AI Code Review
      fetch(`${API_BASE}/api/ai/code-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, topic: problem.title, language }),
      })
        .then((r) => r.json())
        .then((review) => setCodeReview(review))
        .catch(() => {});

      if (data.status === "accepted" && token) {
        fetch(`${API_BASE}/api/progress/update`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: "problem",
            data: { title: problem.title },
          }),
        }).catch(() => {});
      }
      setShowVoice(true);
    } catch (e) {
      setResults({
        mode: "submit",
        status: "error",
        error: "Backend unreachable.",
      });
    }
    setIsSubmitting(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
      analyzeTranscript();
    } else {
      if (
        "webkitSpeechRecognition" in window ||
        "SpeechRecognition" in window
      ) {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SR();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.onresult = (event) => {
          let t = "";
          for (let i = 0; i < event.results.length; i++)
            t += event.results[i][0].transcript;
          setTranscript(t);
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
      const [voiceRes, speechRes] = await Promise.all([
        fetch(`${API_BASE}/api/ai/voice/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript, topic: problem.title }),
        }),
        fetch(`${API_BASE}/api/ai/speech-quality`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript }),
        }),
      ]);
      const voiceData = await voiceRes.json();
      const speechResult = await speechRes.json();
      setVoiceResults(voiceData);
      setSpeechData(speechResult);
    } catch (e) {
      setVoiceResults({
        feedback: "Backend unavailable for analysis.",
        score: 0,
      });
    }
  };

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
              ${selectedId === p.id ? "bg-neon-purple/15 border-neon-purple/40 text-white" : "bg-transparent border-transparent text-gray-400 hover:bg-dark-700/50 hover:text-gray-200"}`}
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
        <h2 className="text-xl font-bold font-orbitron text-neon-cyan mb-3">
          {problem.id}. {problem.title}
        </h2>
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
        <div className="glass-panel overflow-hidden flex-1 flex flex-col relative">
          <div className="flex items-center justify-between px-3 py-1.5 bg-dark-900/50 border-b border-dark-700">
            <div className="flex gap-1">
              {LANGS.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all
                    ${language === lang ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/40" : "text-gray-500 hover:text-gray-300"}`}
                >
                  {lang === "cpp"
                    ? "C++"
                    : lang === "javascript"
                      ? "JavaScript"
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

        {/* Console + Actions */}
        <div
          className={`glass-panel p-3 flex flex-col gap-3 border border-dark-700 transition-all ${showVoice ? "h-auto" : "max-h-[300px]"}`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-orbitron text-gray-400 text-xs uppercase tracking-wider">
              Terminal
            </h3>
            <div className="flex gap-2">
              <button
                onClick={runCode}
                disabled={isRunning || isSubmitting}
                className="flex items-center gap-2 bg-dark-700 hover:bg-dark-600 text-gray-200 px-4 py-1.5 rounded-lg font-bold text-sm transition-all disabled:opacity-50 border border-dark-600"
              >
                {isRunning ? (
                  <Loader size={14} className="animate-spin" />
                ) : (
                  <Play size={14} />
                )}{" "}
                {isRunning ? "Running..." : "Run"}
              </button>
              <button
                onClick={submitCode}
                disabled={isRunning || isSubmitting}
                className="flex items-center gap-2 bg-neon-purple hover:bg-neon-purple/80 text-white px-5 py-1.5 rounded-lg font-bold text-sm shadow-[0_0_10px_#b026ff66] transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}{" "}
                {isSubmitting ? "Judging..." : "Submit"}
              </button>
            </div>
          </div>

          {/* Results Display */}
          {results && (
            <div className="bg-dark-900 p-3 rounded-lg overflow-y-auto font-mono text-xs text-gray-300 border border-dark-800 max-h-[180px] space-y-2">
              {results.mode === "run" && (
                <>
                  <div
                    className={`flex items-center gap-2 text-sm font-bold ${results.passed ? "text-neon-green" : "text-red-400"}`}
                  >
                    {results.passed ? (
                      <CheckCircle size={16} />
                    ) : (
                      <XCircle size={16} />
                    )}
                    {results.passed
                      ? "Test Passed"
                      : results.status === "error"
                        ? "Error"
                        : "Wrong Answer"}
                  </div>
                  {results.runtime > 0 && (
                    <div className="flex items-center gap-2 text-gray-500 text-[11px]">
                      <Clock size={12} /> Runtime: {results.runtime}ms
                    </div>
                  )}
                  {results.output && (
                    <div>
                      <span className="text-gray-500">Output:</span>{" "}
                      {results.output}
                    </div>
                  )}
                  {results.expected && !results.passed && (
                    <div>
                      <span className="text-gray-500">Expected:</span>{" "}
                      {results.expected}
                    </div>
                  )}
                  {results.error && (
                    <div className="text-red-400">{results.error}</div>
                  )}
                </>
              )}
              {results.mode === "submit" && (
                <>
                  <div
                    className={`flex items-center gap-2 text-sm font-bold ${results.status === "accepted" ? "text-neon-green" : "text-red-400"}`}
                  >
                    {results.status === "accepted" ? (
                      <CheckCircle size={16} />
                    ) : (
                      <XCircle size={16} />
                    )}
                    {results.status === "accepted"
                      ? "Accepted ✓"
                      : `Wrong Answer (${results.passed}/${results.total} passed)`}
                  </div>
                  <div className="flex gap-4 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Cpu size={12} /> Pass Rate: {results.passPercentage}%
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> Avg Runtime: {results.avgRuntime}ms
                    </span>
                  </div>
                  {results.results &&
                    results.results.map((r, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 py-1 px-2 rounded ${r.passed ? "bg-neon-green/5" : "bg-red-500/5"}`}
                      >
                        {r.passed ? (
                          <CheckCircle size={12} className="text-neon-green" />
                        ) : (
                          <XCircle size={12} className="text-red-400" />
                        )}
                        <span>
                          Test {r.testCase}: Input: {r.input}
                        </span>
                        {!r.passed && r.actual && (
                          <span className="text-red-400 ml-auto">
                            Got: {r.actual}
                          </span>
                        )}
                        {r.error && (
                          <span className="text-red-400 ml-auto text-[10px]">
                            {r.error.substring(0, 80)}
                          </span>
                        )}
                      </div>
                    ))}
                </>
              )}
            </div>
          )}

          {!results && (
            <div className="bg-dark-900 p-3 rounded-lg font-mono text-xs text-gray-500 border border-dark-800">
              {">"} Click Run to test against first test case, or Submit to
              judge against all test cases...
            </div>
          )}

          {/* Voice AI Section */}
          {showVoice && (
            <div className="mt-2 p-4 bg-dark-900 border border-neon-cyan/40 rounded-lg flex flex-col gap-3 animate-fade-in">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-neon-cyan text-sm flex items-center gap-2">
                  <Mic size={16} /> Explain Your Approach
                </h4>
                <button
                  onClick={toggleRecording}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${isRecording ? "bg-red-500/20 text-red-400 border-red-500/50 animate-pulse" : "bg-dark-700 text-gray-300 hover:bg-neon-cyan hover:text-black border-dark-600"}`}
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
                  <p className="font-bold text-neon-magenta mb-1">
                    AI Score:{" "}
                    <span className="text-white">
                      {Math.round(voiceResults.score || 0)}%
                    </span>
                  </p>
                  <p className="text-xs text-gray-300 mb-2">
                    {voiceResults.feedback}
                  </p>
                  {voiceResults.missedSteps &&
                    voiceResults.missedSteps.length > 0 && (
                      <div className="text-xs">
                        <strong className="text-neon-yellow">
                          Missed Concepts:
                        </strong>
                        <ul className="list-disc pl-4 mt-1">
                          {voiceResults.missedSteps.map((step, i) => (
                            <li key={i} className="text-gray-400">
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              )}
              {/* Speech Quality Analysis */}
              {speechData && (
                <div className="p-3 bg-dark-800 border border-dark-700 rounded-lg text-xs space-y-2">
                  <p className="font-bold text-neon-yellow flex items-center gap-1">
                    <Zap size={12} /> Speech Quality
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-dark-900 rounded border border-dark-700">
                      <p className="text-gray-500 text-[9px]">Clarity</p>
                      <p
                        className={`font-bold ${speechData.clarityScore >= 70 ? "text-neon-green" : "text-neon-yellow"}`}
                      >
                        {speechData.clarityScore}%
                      </p>
                    </div>
                    <div className="text-center p-2 bg-dark-900 rounded border border-dark-700">
                      <p className="text-gray-500 text-[9px]">Structure</p>
                      <p
                        className={`font-bold ${speechData.structureScore >= 60 ? "text-neon-green" : "text-neon-yellow"}`}
                      >
                        {speechData.structureScore}%
                      </p>
                    </div>
                    <div className="text-center p-2 bg-dark-900 rounded border border-dark-700">
                      <p className="text-gray-500 text-[9px]">Fillers</p>
                      <p
                        className={`font-bold ${speechData.totalFillers <= 2 ? "text-neon-green" : "text-red-400"}`}
                      >
                        {speechData.totalFillers}
                      </p>
                    </div>
                  </div>
                  {speechData.suggestions &&
                    speechData.suggestions.length > 0 && (
                      <div className="space-y-1 mt-1">
                        {speechData.suggestions.map((s, i) => (
                          <p key={i} className="text-gray-400 text-[11px]">
                            💡 {s}
                          </p>
                        ))}
                      </div>
                    )}
                </div>
              )}
            </div>
          )}

          {/* Code Review AI Panel */}
          {codeReview && <CodeReviewPanel reviewData={codeReview} />}
        </div>
      </div>
    </div>
  );
}
