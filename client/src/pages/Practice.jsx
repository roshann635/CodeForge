import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Editor from "@monaco-editor/react";
import CodeReviewPanel from "../components/CodeReviewPanel";
import API_BASE from "../config/api";
import { Link } from "react-router-dom";
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
  ExternalLink,
} from "lucide-react";

import { PROBLEMS } from "../data/problems.js";

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

  const runCode = async () => {
    setIsRunning(true);
    setResults(null);
    try {
      const res = await fetch(`${API_BASE}/api/code/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          problemId: problem.id,
        }),
      });
      const data = await res.json();
      setResults({
        mode: "run",
        status: data.status,
        results: data.results,
        totalRuntime: data.totalRuntime,
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

  const submitCode = async () => {
    if (!token) {
      setResults({ mode: "submit", status: "ERROR", error: "Please log in to submit." });
      return;
    }
    setIsSubmitting(true);
    setResults(null);
    try {
      const res = await fetch(`${API_BASE}/api/code/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code,
          language,
          problemId: problem.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message);
      setResults({ mode: "submit", ...data });

      fetch(`${API_BASE}/api/ai/code-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, topic: problem.title, language }),
      })
        .then((r) => r.json())
        .then((review) => setCodeReview(review))
        .catch(() => {});

      if (data.status === "ACCEPTED" && token) {
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
        error: e.message || "Backend unreachable.",
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
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-xl font-bold font-orbitron text-neon-cyan">
            {problem.id}. {problem.title}
          </h2>
          <Link
            to={`/codelab/${problem.id}`}
            className="px-3 py-1 bg-neon-purple hover:bg-neon-purple/80 text-white rounded-lg text-xs font-bold shadow-[0_0_10px_#b026ff66] transition-all flex items-center gap-1.5"
          >
            <ExternalLink size={12} /> Open in CodeLab
          </Link>
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
                    className={`flex items-center gap-2 text-sm font-bold ${results.status === "PASSED" ? "text-neon-green" : "text-red-400"}`}
                  >
                    {results.status === "PASSED" ? (
                      <CheckCircle size={16} />
                    ) : (
                      <XCircle size={16} />
                    )}
                    {results.status === "PASSED"
                      ? "Public Tests Passed"
                      : results.status === "error"
                        ? "Error"
                        : "Test Failed"}
                  </div>
                  {results.totalRuntime > 0 && (
                    <div className="flex items-center gap-2 text-gray-500 text-[11px]">
                      <Clock size={12} /> Runtime: {results.totalRuntime}ms
                    </div>
                  )}
                  {results.results?.map((r, idx) => (
                    <div key={idx} className="border-t border-dark-700 pt-2 mt-2">
                      <span className="text-gray-500">Case {r.testCaseIndex}:</span>{" "}
                      {r.passed ? (
                        <span className="text-neon-green">Passed</span>
                      ) : (
                        <>
                          <span className="text-red-400">Failed</span>
                          {r.expected && (
                            <span className="text-gray-500"> | Expected: {r.expected} | Got: {r.actual}</span>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                  {results.error && (
                    <div className="text-red-400">{results.error}</div>
                  )}
                </>
              )}
              {results.mode === "submit" && (
                <>
                  <div
                    className={`flex items-center gap-2 text-sm font-bold ${results.status === "ACCEPTED" ? "text-neon-green" : "text-red-400"}`}
                  >
                    {results.status === "ACCEPTED" ? (
                      <CheckCircle size={16} />
                    ) : (
                      <XCircle size={16} />
                    )}
                    {results.status === "ACCEPTED"
                      ? "Accepted ✓"
                      : results.status === "PARTIAL_ACCEPTED"
                        ? `Partial (${results.passed}/${results.total})`
                        : results.status || "Wrong Answer"}
                  </div>
                  {results.passed != null && (
                    <div className="text-gray-400 text-[11px]">
                      {results.passed}/{results.total} test cases passed ({results.passPercentage || 0}%)
                    </div>
                  )}
                  <div className="flex gap-4 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Cpu size={12} /> Pass Rate: {results.passPercentage}%
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> Runtime: {results.runtime || 0}ms
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
