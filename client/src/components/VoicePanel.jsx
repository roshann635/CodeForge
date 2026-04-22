import React, { useState, useEffect, useRef } from "react";
import { Mic, Square, Loader, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VoicePanel({ transcript, setTranscript, onAnalyze, isAnalyzing }) {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (event) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };
      recognitionRef.current.onerror = (e) => {
        console.error("Speech reco error: ", e);
        setIsRecording(false);
      };
    } else {
      console.error("Speech recognition not supported");
    }

    return () => {
      if (recognitionRef.current) {
         recognitionRef.current.stop();
      }
    };
  }, [setTranscript]);

  const toggleRecording = () => {
    if (!recognitionRef.current) return alert("Browser does not support Speech Recognition");
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-900 border border-dark-600 rounded-lg overflow-hidden glass-panel">
      <div className="p-3 bg-dark-800 border-b border-dark-600 flex items-center justify-between">
         <h3 className="text-white text-sm font-bold font-orbitron flex items-center gap-2">
            <Mic className="text-neon-cyan" size={16} /> Verbal Execution
         </h3>
         {isRecording && (
            <motion.div
               animate={{ scale: [1, 1.2, 1] }}
               transition={{ repeat: Infinity, duration: 1.5 }}
               className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"
            />
         )}
      </div>

      <div className="flex-1 p-3">
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Explain your approach..."
          className="w-full h-full bg-transparent text-gray-300 resize-none outline-none font-mono text-sm placeholder-gray-600"
        ></textarea>
      </div>

      <div className="p-3 bg-dark-800 border-t border-dark-600 flex flex-col gap-2">
        <button
          onClick={toggleRecording}
          disabled={isAnalyzing}
          className={`flex items-center justify-center gap-2 w-full py-2 rounded font-orbitron text-xs font-bold transition-all duration-300 ${
            isRecording ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/50" : "bg-dark-700 text-white hover:bg-dark-600 border border-dark-600"
          }`}
        >
           {isRecording ? <Square size={14} /> : <Mic size={14} />}
           {isRecording ? "STOP RECORDING" : "START RECORDING"}
        </button>

        <button
          onClick={onAnalyze}
          disabled={!transcript || isAnalyzing || isRecording}
          className="flex items-center justify-center gap-2 w-full py-2 bg-gradient-to-r from-neon-cyan to-neon-purple text-white rounded font-orbitron text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(0,243,255,0.4)] transition-all"
        >
          {isAnalyzing ? (
            <><Loader className="animate-spin" size={14} /> ANALYZING YOUR THINKING...</>
          ) : (
            <><CheckCircle size={14} /> ANALYZE EXPLANATION</>
          )}
        </button>
      </div>
    </div>
  );
}
