import React, { useState, useEffect } from "react";
import { generateArrayTrace } from "../engines/traceEngine";
import { Play, Pause, RotateCcw, FastForward, Sliders, Code, Terminal, Sparkles } from "lucide-react";

const ALGORITHM_CODES = {
  "Bubble Sort": `function bubbleSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`,
  "Selection Sort": `function selectionSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    swap(arr, i, minIdx);
  }
}`,
  "Binary Search": `function binarySearch(arr, target) {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    let mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`,
};

export default function DynamicVisualizer() {
  const [inputStr, setInputStr] = useState("5, 2, 8, 1, 9, 3");
  const [algorithm, setAlgorithm] = useState("Bubble Sort");
  const [speed, setSpeed] = useState(600); // ms per step

  const [trace, setTrace] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    parseAndBuildTrace();
  }, [inputStr, algorithm]);

  useEffect(() => {
    let timer;
    if (isPlaying && trace && currentStep < trace.events.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, speed);
    } else if (currentStep >= (trace?.events.length || 1) - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, trace, speed]);

  const parseAndBuildTrace = () => {
    const parsed = inputStr
      .split(/[, ]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    const result = generateArrayTrace(parsed.length > 0 ? parsed : [5, 2, 8, 1], algorithm);
    setTrace(result);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const currentEvent = trace?.events[currentStep] || {
    type: "INIT",
    indices: [],
    values: [5, 2, 8, 1],
    line: 1,
    text: "Ready to run execution trace...",
  };

  const activeValues = currentEvent.values || [5, 2, 8, 1];
  const maxVal = Math.max(...activeValues, 10);

  return (
    <div className="p-6 space-y-6 text-white bg-dark-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple flex items-center gap-3">
            <Sparkles className="text-neon-cyan" /> Dynamic Runtime Visualizer
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            User Code → Dynamic Instrumentation → Deterministic Event Trace → Live Synchronized Animation
          </p>
        </div>
      </div>

      {/* Input Controls Bar */}
      <div className="bg-dark-800/70 border border-dark-700 p-4 rounded-2xl flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-400 mb-1">Array Input</label>
          <input
            type="text"
            value={inputStr}
            onChange={(e) => setInputStr(e.target.value)}
            placeholder="5, 2, 8, 1, 9"
            className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-neon-cyan"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Algorithm</label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            className="bg-dark-900 border border-dark-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
          >
            <option value="Bubble Sort">Bubble Sort</option>
            <option value="Selection Sort">Selection Sort</option>
            <option value="Binary Search">Binary Search</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Speed: {speed}ms</label>
          <input
            type="range"
            min={100}
            max={1500}
            step={100}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-32 accent-neon-cyan cursor-pointer"
          />
        </div>

        {/* Animation Controls */}
        <div className="flex items-center gap-2 pt-5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 bg-neon-cyan hover:bg-neon-cyan/80 text-black px-4 py-2 rounded-xl font-bold text-xs shadow-[0_0_10px_#00f3ff55] transition-all"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? "Pause" : "Run Trace"}
          </button>

          <button
            onClick={() => {
              setCurrentStep(0);
              setIsPlaying(false);
            }}
            className="p-2 bg-dark-700 hover:bg-dark-600 rounded-xl text-gray-300 transition-colors"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Main Visualizer + Code Sync split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Dynamic Visualizer Container (8 cols) */}
        <div className="lg:col-span-7 bg-dark-800/60 border border-dark-700 p-6 rounded-2xl flex flex-col min-h-[420px]">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-orbitron font-bold text-neon-cyan uppercase">
              Runtime Visualizer Canvas
            </span>
            <span className="text-xs font-mono text-gray-400">
              Step {currentStep + 1} / {trace?.events.length || 1}
            </span>
          </div>

          {/* Bar Chart Bars */}
          <div className="flex-1 flex items-end justify-center gap-3 py-6 px-4 bg-dark-950/60 rounded-xl border border-dark-800">
            {activeValues.map((val, idx) => {
              const isHighlight = currentEvent.indices && currentEvent.indices.includes(idx);
              const heightPercent = Math.max((val / maxVal) * 80, 15);

              return (
                <div key={idx} className="flex flex-col items-center flex-1 max-w-[50px] transition-all duration-300">
                  <span className="text-xs font-mono font-bold text-white mb-2">{val}</span>
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      isHighlight
                        ? currentEvent.type === "SWAP"
                          ? "bg-neon-magenta shadow-[0_0_15px_#ff00ea]"
                          : currentEvent.type === "FOUND"
                          ? "bg-neon-green shadow-[0_0_15px_#39ff14]"
                          : "bg-neon-yellow shadow-[0_0_15px_#fbff00]"
                        : "bg-neon-cyan/60 border border-neon-cyan/40"
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                  <span className="text-[10px] font-mono text-gray-500 mt-2">[{idx}]</span>
                </div>
              );
            })}
          </div>

          {/* Event Log Description */}
          <div className="mt-4 p-3 bg-dark-900 border border-dark-700 rounded-xl flex items-center gap-3">
            <Terminal size={18} className="text-neon-cyan flex-shrink-0" />
            <p className="text-xs font-mono text-gray-200">{currentEvent.text}</p>
          </div>
        </div>

        {/* Right: Code Synchronization Panel (5 cols) */}
        <div className="lg:col-span-5 bg-dark-800/60 border border-dark-700 p-6 rounded-2xl flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Code size={18} className="text-neon-purple" />
            <h2 className="text-sm font-orbitron font-bold text-white">Execution Code Highlight</h2>
          </div>

          <div className="flex-1 bg-dark-950 p-4 rounded-xl border border-dark-800 font-mono text-xs text-gray-300 space-y-1 overflow-y-auto">
            {(ALGORITHM_CODES[algorithm] || ALGORITHM_CODES["Bubble Sort"]).split("\n").map((lineText, lIdx) => {
              const lineNum = lIdx + 1;
              const isCurrentLine = currentEvent.line === lineNum;

              return (
                <div
                  key={lIdx}
                  className={`px-2 py-0.5 rounded flex items-center gap-3 transition-colors ${
                    isCurrentLine ? "bg-neon-purple/30 text-white font-bold border-l-2 border-neon-purple" : ""
                  }`}
                >
                  <span className="text-gray-600 w-5 text-right select-none">{lineNum}</span>
                  <pre className="flex-1 whitespace-pre">{lineText}</pre>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
