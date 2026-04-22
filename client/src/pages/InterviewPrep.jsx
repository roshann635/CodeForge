import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import VoicePanel from "../components/VoicePanel";
import { Play, Send, CheckCircle, Code, MessageSquare, Zap, Activity, ShieldAlert, Cpu, Award } from "lucide-react";
import { motion } from "framer-motion";

const QUESTIONS = {
  "Binary Search": {
    title: "Binary Search",
    description: "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.",
    exampleInput: "nums = [-1,0,3,5,9,12], target = 9",
    exampleOutput: "4",
    constraints: ["1 <= nums.length <= 10^4", "All the integers in `nums` are unique."]
  },
  "Bubble Sort": {
    title: "Bubble Sort",
    description: "Write a function that takes an array of integers and returns a sorted array using the Bubble Sort algorithm.",
    exampleInput: "nums = [5, 2, 9, 1, 5, 6]",
    exampleOutput: "[1, 2, 5, 5, 6, 9]",
    constraints: ["1 <= nums.length <= 10^4"]
  },
  "Merge Sort": {
    title: "Merge Sort",
    description: "Implement the Merge Sort algorithm to sort an array of integers in ascending order. You must solve it in O(n log n) time.",
    exampleInput: "nums = [12, 11, 13, 5, 6, 7]",
    exampleOutput: "[5, 6, 7, 11, 12, 13]",
    constraints: ["1 <= nums.length <= 5*10^4"]
  },
  "Quick Sort": {
    title: "Quick Sort",
    description: "Implement the Quick Sort algorithm. Pick an element as a pivot and partition the given array around the picked pivot.",
    exampleInput: "nums = [10, 7, 8, 9, 1, 5]",
    exampleOutput: "[1, 5, 7, 8, 9, 10]",
    constraints: ["1 <= nums.length <= 5*10^4"]
  },
  "BFS": {
    title: "Breadth-First Search",
    description: "Implement BFS to traverse a graph. Given an adjacency list and a starting node, return the sequence of visited nodes.",
    exampleInput: "graph = {0: [1,2], 1: [2], 2: [0,3], 3: [3]}, start = 2",
    exampleOutput: "[2, 0, 3, 1]",
    constraints: ["0 <= V <= 100", "0 <= E <= 10^4"]
  },
  "DFS": {
    title: "Depth-First Search",
    description: "Implement DFS to traverse a graph. Given an adjacency list and a starting node, return the sequence of visited nodes.",
    exampleInput: "graph = {0: [1,2], 1: [2], 2: [0,3], 3: [3]}, start = 2",
    exampleOutput: "[2, 0, 1, 3] (Depends on edge traversal order)",
    constraints: ["0 <= V <= 100", "0 <= E <= 10^4"]
  },
  "Hash Map": {
    title: "Two Sum (Hash Map)",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You must solve it using a Hash Map.",
    exampleInput: "nums = [2,7,11,15], target = 9",
    exampleOutput: "[0, 1]",
    constraints: ["2 <= nums.length <= 10^4", "Only one valid answer exists."]
  },
  "Two Pointers": {
    title: "Valid Palindrome",
    description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.",
    exampleInput: 's = "A man, a plan, a canal: Panama"',
    exampleOutput: "true",
    constraints: ["1 <= s.length <= 2 * 10^5"]
  }
};

export default function InterviewPrep() {
  const [topic, setTopic] = useState("Binary Search");
  const [code, setCode] = useState("// Write your solution here\n");
  const [transcript, setTranscript] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  
  // Timer logic
  const [thinkingTime, setThinkingTime] = useState(0);
  const [isThinking, setIsThinking] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    // Start thinking timer
    timerRef.current = setInterval(() => {
      if (isThinking) {
        setThinkingTime(prev => prev + 1000);
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isThinking]);

  const handleEditorChange = (value) => {
    setCode(value);
    if (isThinking) setIsThinking(false);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setIsThinking(false);
    try {
      const resp = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          topic,
          code,
          thinkingTime
        })
      });
      const data = await resp.json();
      setResult(data);

      const history = JSON.parse(localStorage.getItem("interview_history") || "[]");
      history.push({
        topic,
        finalScore: data.finalScore,
        thinkingTime,
        date: new Date().toISOString()
      });
      localStorage.setItem("interview_history", JSON.stringify(history));
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
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
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-4 text-white p-2">
      <div className="flex justify-between items-center mb-2">
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
             {Object.keys(QUESTIONS).map(q => (
               <option key={q} value={q}>{q}</option>
             ))}
           </select>
         </div>
         <div className="flex gap-4 items-center">
            <span className="text-sm font-mono text-gray-400">
               Thinking Time: {(thinkingTime / 1000).toFixed(0)}s
            </span>
         </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        
        {/* Left Panel: Problem Statement */}
        <div className="glass-panel p-5 border border-dark-600 flex flex-col overflow-y-auto">
          <h3 className="text-lg font-bold font-orbitron text-neon-cyan mb-4">{QUESTIONS[topic].title}</h3>
          <p className="text-gray-300 text-sm mb-4 leading-relaxed font-mono">
            {QUESTIONS[topic].description}
          </p>
          <div className="bg-dark-900 border border-dark-700 p-3 rounded mb-4">
             <p className="text-xs font-mono text-gray-400">Example Output</p>
             <p className="text-sm text-neon-yellow mt-1">Input: {QUESTIONS[topic].exampleInput}</p>
             <p className="text-sm text-neon-yellow">Output: {QUESTIONS[topic].exampleOutput}</p>
          </div>
          <div className="bg-dark-900 border border-dark-700 p-3 rounded mb-4">
             <p className="text-xs font-mono text-gray-400">Constraints</p>
             <ul className="text-sm text-gray-400 list-disc pl-4 mt-2">
                {QUESTIONS[topic].constraints.map((c, i) => <li key={i}>{c}</li>)}
             </ul>
          </div>
        </div>

        {/* Center Panel: Editor */}
        <div className="glass-panel border border-dark-600 flex flex-col relative overflow-hidden group">
           <div className="flex justify-between items-center p-2 bg-dark-800 border-b border-dark-600">
              <span className="text-xs font-bold font-orbitron text-gray-400 flex items-center gap-2"><Code size={14}/> SOLUTION IDE</span>
              <div className="flex gap-2">
                 <button className="bg-dark-700 hover:bg-dark-600 p-1.5 rounded transition-colors" onClick={handleAnalyze} disabled={isAnalyzing}><Play size={14} className="text-neon-cyan" /></button>
                 <button className="bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan p-1.5 rounded transition-colors flex items-center gap-1 text-xs font-bold font-orbitron" onClick={handleAnalyze} disabled={isAnalyzing}><Send size={14}/> SUBMIT</button>
              </div>
           </div>
           
           <div 
             className="flex-1 w-full"
             onPaste={(e) => { e.preventDefault(); alert("Pasting strictly restricted in Interview Mode."); }}
             onCopy={(e) => { e.preventDefault(); alert("Copying strictly restricted in Interview Mode."); }}
           >
             <Editor
              height="100%"
              defaultLanguage="javascript"
              value={code}
              theme="vs-dark"
              onChange={handleEditorChange}
              options={{ minimap: { enabled: false }, fontSize: 14 }}
             />
           </div>
        </div>

        {/* Right Panel: Voice Panel & Results */}
        <div className="flex flex-col gap-4 min-h-0 overflow-y-auto">
           <div className="flex-1 min-h-[300px]">
             <VoicePanel 
                transcript={transcript} 
                setTranscript={setTranscript} 
                onAnalyze={handleAnalyze} 
                isAnalyzing={isAnalyzing} 
             />
           </div>
           
           {/* Results UI */}
           {result && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-4 border border-dark-600 flex flex-col"
              >
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-dark-600">
                   <h3 className="font-orbitron font-bold text-gray-200">Evaluation Report</h3>
                   <div className={`p-2 rounded border font-bold text-lg ${getBgColor(result.finalScore)} ${getColor(result.finalScore)}`}>
                     {result.finalScore} / 100
                   </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                   <div className={`p-3 rounded border text-center ${getBgColor(result.codeScore)}`}>
                     <Code size={16} className={`mx-auto mb-1 flex justify-center ${getColor(result.codeScore)}`} />
                     <p className="text-[10px] text-gray-400 font-mono">Code</p>
                     <p className={`font-bold tracking-widest ${getColor(result.codeScore)}`}>{result.codeScore}</p>
                   </div>
                   <div className={`p-3 rounded border text-center ${getBgColor(result.logicScore)}`}>
                     <Activity size={16} className={`mx-auto mb-1 flex justify-center ${getColor(result.logicScore)}`} />
                     <p className="text-[10px] text-gray-400 font-mono">Logic</p>
                     <p className={`font-bold tracking-widest ${getColor(result.logicScore)}`}>{result.logicScore}</p>
                   </div>
                   <div className={`p-3 rounded border text-center ${getBgColor(result.communicationScore)}`}>
                     <MessageSquare size={16} className={`mx-auto mb-1 flex justify-center ${getColor(result.communicationScore)}`} />
                     <p className="text-[10px] text-gray-400 font-mono">Comm.</p>
                     <p className={`font-bold tracking-widest ${getColor(result.communicationScore)}`}>{result.communicationScore}</p>
                   </div>
                   <div className={`p-3 rounded border text-center ${getBgColor(result.speedScore)}`}>
                     <Zap size={16} className={`mx-auto mb-1 flex justify-center ${getColor(result.speedScore)}`} />
                     <p className="text-[10px] text-gray-400 font-mono">Speed</p>
                     <p className={`font-bold tracking-widest ${getColor(result.speedScore)}`}>{result.speedScore}</p>
                   </div>
                   <div className={`p-3 rounded border text-center ${getBgColor(result.edgeScore)}`}>
                     <ShieldAlert size={16} className={`mx-auto mb-1 flex justify-center ${getColor(result.edgeScore)}`} />
                     <p className="text-[10px] text-gray-400 font-mono">Edge Case</p>
                     <p className={`font-bold tracking-widest ${getColor(result.edgeScore)}`}>{result.edgeScore}</p>
                   </div>
                   <div className={`p-3 rounded border text-center ${getBgColor(result.patternScore)}`}>
                     <Cpu size={16} className={`mx-auto mb-1 flex justify-center ${getColor(result.patternScore)}`} />
                     <p className="text-[10px] text-gray-400 font-mono">Pattern</p>
                     <p className={`font-bold tracking-widest ${getColor(result.patternScore)}`}>{result.patternScore}</p>
                   </div>
                   <div className={`col-span-2 p-3 rounded border text-center ${getBgColor(result.confidenceScore)}`}>
                     <Award size={16} className={`mx-auto mb-1 flex justify-center ${getColor(result.confidenceScore)}`} />
                     <p className="text-[10px] text-gray-400 font-mono">Confidence</p>
                     <p className={`font-bold tracking-widest ${getColor(result.confidenceScore)}`}>{result.confidenceScore}</p>
                   </div>
                </div>

                <div className="bg-dark-900 border border-dark-700 p-4 rounded text-sm text-gray-300 font-mono mb-4 leading-relaxed tracking-wide">
                  <strong className="text-neon-cyan mb-2 block">AI VERDICT:</strong>
                  {result.feedback}
                </div>

                {result.followUpQuestion && (
                  <div className="bg-neon-purple/5 border border-neon-purple/40 p-4 rounded text-sm text-neon-purple font-mono leading-relaxed">
                     <strong className="mb-2 block tracking-wider font-bold">💬 AI Interviewer Follow-Up:</strong>
                     {result.followUpQuestion}
                  </div>
                )}
              </motion.div>
           )}
        </div>

      </div>
    </div>
  );
}
