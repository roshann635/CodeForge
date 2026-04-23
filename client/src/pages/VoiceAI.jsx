import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, BrainCircuit, Volume2 } from "lucide-react";

const TOPICS = [
  "Binary Search",
  "Bubble Sort",
  "Merge Sort",
  "Quick Sort",
  "BFS",
  "DFS",
  "Hash Map",
  "Two Pointers",
];

const SAMPLE_TRANSCRIPTS = {
  "Binary Search":
    "Binary search works on a sorted array by checking the middle element. If the target is less than the middle, we search the left half. If greater, we search the right half. This halves the search space each time giving us logarithmic time complexity.",
  "Bubble Sort":
    "Bubble sort works by comparing adjacent elements and swapping them if they're in the wrong order. After each pass, the largest element bubbles to the end. The time complexity is O(n squared) and it's a stable in-place sorting algorithm.",
  "Merge Sort":
    "Merge sort uses divide and conquer. We divide the array in half recursively until we have single elements, then merge the sorted subarrays back together. It has O(n log n) time complexity but requires O(n) extra space.",
  "Quick Sort":
    "Quick sort picks a pivot element, then partitions the array so elements less than pivot go left and greater go right. We recursively sort both partitions. Average case is O(n log n) but worst case with bad pivot is O(n squared).",
  BFS: "BFS or breadth first search uses a queue to traverse a graph level by level. We start at a node, visit all its neighbors, then visit their neighbors. It's useful for finding shortest path in unweighted graphs. Time complexity is O(V+E).",
  DFS: "DFS or depth first search uses a stack or recursion to explore as deep as possible along each branch before backtracking. It's useful for cycle detection and topological sorting in graphs. Time complexity is O(V+E).",
  "Hash Map":
    "A hash map uses a hash function to map keys to indices in an array for O(1) average lookup time. When two keys map to the same index, we have a collision, which can be resolved through chaining with linked lists or open addressing.",
  "Two Pointers":
    "The two pointers technique uses two pointers that converge from opposite ends of a sorted array. We move the left pointer right if the sum is too small, or the right pointer left if too large. This gives us O(n) time for problems like pair sum.",
};

export default function VoiceAI() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [results, setResults] = useState(null);
  const [topic, setTopic] = useState("Binary Search");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");

  useEffect(() => {
    // Initialize speech recognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        finalTranscriptRef.current = finalTranscript;
        setTranscript(finalTranscript + interimTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      const finalTranscript =
        finalTranscriptRef.current ||
        transcript ||
        SAMPLE_TRANSCRIPTS[topic] ||
        "This is a sample explanation.";
      analyzeTranscript(finalTranscript);
    } else {
      // Start recording
      if (recognitionRef.current) {
        finalTranscriptRef.current = "";
        setTranscript("");
        setResults(null);
        recognitionRef.current.start();
        setIsRecording(true);
      } else {
        // Fallback to sample if speech recognition not available
        setIsRecording(true);
        setTranscript("");
        setResults(null);
        setTimeout(() => {
          setTranscript(
            SAMPLE_TRANSCRIPTS[topic] || "Sample explanation for " + topic,
          );
        }, 2500);
      }
    }
  };

  const analyzeTranscript = async (finalTranscript) => {
    setTranscript(finalTranscript);
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/ai/voice/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: finalTranscript, topic }),
      });
      const data = await res.json();
      setResults(data);

      // Send progress update
      fetch("/api/progress/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "voice",
          data: { topic, score: data.score },
        }),
      }).catch((err) => console.log("Progress update failed"));
    } catch (e) {
      // Offline fallback
      const words = finalTranscript.toLowerCase().split(/\W+/);
      const score = Math.min(95, 50 + words.length);
      setResults({
        score: score.toFixed(2),
        confidence: Math.min(90, 40 + words.length * 2).toFixed(2),
        communication: words.length > 30 ? 90 : words.length > 15 ? 60 : 30,
        feedback:
          score > 70
            ? "Good explanation with key concepts covered."
            : "Try to cover more key concepts.",
        missedSteps: [],
        matchedKeywords: [],
      });
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-white">
      {/* Header */}
      <div className="text-center space-y-3 mb-8">
        <h2 className="text-3xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-magenta text-glow-magenta">
          Voice AI Evaluator
        </h2>
        <p className="text-gray-400 text-sm">
          Explain an algorithm and let our AI engine grade your communication.
        </p>

        <div className="flex items-center justify-center gap-3 mt-4">
          <label className="text-xs text-gray-500">Topic:</label>
          <select
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              setResults(null);
              setTranscript("");
            }}
            className="bg-dark-800 border border-dark-600 text-white px-3 py-2 rounded-lg text-sm focus:border-neon-cyan outline-none transition-colors"
          >
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recording Area */}
      <div className="glass-panel p-10 flex flex-col items-center justify-center relative overflow-hidden">
        {isRecording && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-neon-purple/5 animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-neon-magenta/20 animate-ping"></div>
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-neon-purple/10 animate-ping"
              style={{ animationDelay: "0.5s" }}
            ></div>
          </div>
        )}

        <button
          onClick={toggleRecording}
          disabled={isAnalyzing}
          className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500
            ${
              isRecording
                ? "bg-gradient-to-br from-neon-magenta to-neon-purple text-white shadow-[0_0_40px_#ff00ea66,0_0_80px_#ff00ea22] scale-110"
                : "bg-dark-700 text-gray-400 hover:bg-gradient-to-br hover:from-neon-purple hover:to-neon-magenta hover:text-white hover:shadow-[0_0_30px_#b026ff44] hover:scale-105"
            }
            ${isAnalyzing ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isRecording ? (
            <Mic size={44} className="animate-bounce" />
          ) : (
            <MicOff size={44} />
          )}
        </button>

        <p className="mt-6 text-sm font-medium tracking-wide text-gray-300">
          {isAnalyzing
            ? "🧠 Analyzing your response..."
            : isRecording
              ? "🎙️ Listening & Recording..."
              : "Click to start your explanation"}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {isRecording ? "Click again to stop and analyze" : `Topic: ${topic}`}
        </p>
        {!("webkitSpeechRecognition" in window) &&
          !("SpeechRecognition" in window) && (
            <p className="text-xs text-neon-yellow mt-2">
              ⚠️ Speech recognition not supported in this browser. Using sample
              transcripts.
            </p>
          )}

        {transcript && (
          <div className="mt-6 w-full bg-dark-900/80 border border-dark-700 p-5 rounded-xl relative">
            <div className="absolute -top-2.5 -right-2.5 bg-dark-800 border border-dark-600 rounded-full p-1.5">
              <Volume2 className="text-neon-cyan" size={14} />
            </div>
            <p className="text-gray-300 text-sm italic leading-relaxed">
              "{transcript}"
            </p>
          </div>
        )}
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-4 animate-fade-in">
          {/* Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ScoreCard
              title="Confidence"
              score={results.confidence}
              color="cyan"
            />
            <ScoreCard
              title="Logic Score"
              score={results.score}
              color="purple"
            />
            <ScoreCard
              title="Communication"
              score={results.communication}
              color="magenta"
            />
          </div>

          {/* Detailed Feedback */}
          <div className="glass-panel p-5 border border-dark-700">
            <div className="flex items-center gap-2 mb-3">
              <BrainCircuit size={18} className="text-neon-cyan" />
              <h3 className="text-lg font-bold font-orbitron text-neon-cyan">
                AI Feedback
              </h3>
            </div>
            <p className="text-gray-300 text-sm bg-dark-900/50 p-4 rounded-lg leading-relaxed">
              {results.feedback}
            </p>

            {results.matchedKeywords && results.matchedKeywords.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Keywords matched:</p>
                <div className="flex flex-wrap gap-1.5">
                  {results.matchedKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 bg-neon-green/10 text-neon-green border border-neon-green/30 rounded-full"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {results.missedSteps && results.missedSteps.length > 0 && (
              <div className="mt-4 border-l-4 border-neon-yellow pl-4 py-2">
                <p className="text-neon-yellow font-bold text-sm mb-2">
                  ⚠ Concept gaps detected:
                </p>
                <ul className="space-y-1">
                  {results.missedSteps.map((step, i) => (
                    <li
                      key={i}
                      className="text-gray-400 text-sm flex items-center gap-2"
                    >
                      <span className="w-1 h-1 bg-neon-yellow rounded-full flex-shrink-0"></span>
                      Mention "{step}"
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreCard({ title, score, color }) {
  const numScore = parseFloat(score);
  const configs = {
    cyan: {
      text: "text-neon-cyan",
      border: "border-neon-cyan/40",
      shadow: "shadow-[inset_0_0_25px_rgba(0,243,255,0.1)]",
      glow: "text-shadow: 0 0 8px #00f3ff",
      bg: "bg-neon-cyan",
    },
    purple: {
      text: "text-neon-purple",
      border: "border-neon-purple/40",
      shadow: "shadow-[inset_0_0_25px_rgba(176,38,255,0.1)]",
      glow: "text-shadow: 0 0 8px #b026ff",
      bg: "bg-neon-purple",
    },
    magenta: {
      text: "text-neon-magenta",
      border: "border-neon-magenta/40",
      shadow: "shadow-[inset_0_0_25px_rgba(255,0,234,0.1)]",
      glow: "text-shadow: 0 0 8px #ff00ea",
      bg: "bg-neon-magenta",
    },
  };
  const c = configs[color];

  return (
    <div
      className={`glass-panel p-5 flex flex-col items-center justify-center border ${c.border} ${c.shadow} transition-all hover:-translate-y-1`}
    >
      <p className="text-gray-400 font-medium text-xs uppercase tracking-wider mb-2">
        {title}
      </p>
      <p
        className={`text-4xl font-bold font-orbitron ${c.text}`}
        style={{ textShadow: `0 0 8px currentColor` }}
      >
        {Math.round(numScore)}%
      </p>
      {/* Progress bar */}
      <div className="w-full mt-3 bg-dark-900 rounded-full h-1.5 overflow-hidden">
        <div
          className={`${c.bg} h-1.5 rounded-full transition-all duration-1000`}
          style={{ width: `${numScore}%` }}
        ></div>
      </div>
    </div>
  );
}
