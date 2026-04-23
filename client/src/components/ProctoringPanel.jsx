import React, { useState, useEffect, useRef, useCallback } from "react";
import * as faceapi from "face-api.js";
import { Video, VideoOff, AlertTriangle, Eye, Users, Shield, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const VIOLATION_WEIGHTS = {
  tab_switch: 5,
  no_face: 15,
  multiple_faces: 20,
  copy_paste: 10,
  window_blur: 5,
  looking_away: 8,
};

export default function ProctoringPanel({ isActive, onViolation, onScoreUpdate }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const detectIntervalRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [violations, setViolations] = useState([]);
  const [integrityScore, setIntegrityScore] = useState(100);
  const [currentStatus, setCurrentStatus] = useState("Initializing...");
  const [statusColor, setStatusColor] = useState("text-gray-400");
  const [faceCount, setFaceCount] = useState(0);
  const [showTimeline, setShowTimeline] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState(null);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/";
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setCurrentStatus("Models loaded. Click to start camera.");
      } catch (e) {
        console.error("Face model load error:", e);
        setCurrentStatus("Face models failed — using tab detection only");
        setModelsLoaded(false);
      }
    };
    loadModels();
  }, []);

  // Tab visibility detection
  useEffect(() => {
    if (!isActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logViolation("tab_switch", "Tab switched away during interview");
      }
    };

    const handleWindowBlur = () => {
      logViolation("window_blur", "Window lost focus");
    };

    const handleCopyPaste = (e) => {
      if (e.type === "copy" || e.type === "cut") {
        logViolation("copy_paste", `${e.type} detected during interview`);
      }
      if (e.type === "paste") {
        logViolation("copy_paste", "Paste detected during interview");
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);
    document.addEventListener("cut", handleCopyPaste);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
      document.removeEventListener("cut", handleCopyPaste);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [isActive]);

  const logViolation = useCallback((type, details) => {
    const weight = VIOLATION_WEIGHTS[type] || 5;
    const violation = {
      type,
      details,
      weight,
      timestamp: new Date().toISOString(),
      timeStr: new Date().toLocaleTimeString(),
    };

    setViolations((prev) => {
      const updated = [...prev, violation];
      const totalWeight = updated.reduce((sum, v) => sum + v.weight, 0);
      const newScore = Math.max(0, 100 - totalWeight);
      setIntegrityScore(newScore);
      onScoreUpdate?.(newScore);
      onViolation?.(violation);
      return updated;
    });
  }, [onViolation, onScoreUpdate]);

  // Start camera + recording
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraOn(true);
      setCurrentStatus("Camera active — Monitoring...");
      setStatusColor("text-neon-green");

      // Start recording
      try {
        const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
        chunksRef.current = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: "video/webm" });
          setRecordedUrl(URL.createObjectURL(blob));
        };
        recorder.start(1000);
        recorderRef.current = recorder;
      } catch (recErr) {
        console.warn("Recording not supported:", recErr);
      }

      // Start face detection loop
      startDetection();
    } catch (err) {
      console.error("Camera error:", err);
      setCurrentStatus("Camera access denied");
      setStatusColor("text-red-400");
    }
  };

  const stopCamera = () => {
    if (detectIntervalRef.current) clearInterval(detectIntervalRef.current);
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setCameraOn(false);
    setCurrentStatus("Camera stopped");
    setStatusColor("text-gray-400");
  };

  const startDetection = () => {
    if (!modelsLoaded) return;
    detectIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.4 }))
        .withFaceLandmarks(true);

      setFaceCount(detections.length);

      // Draw detections on canvas
      if (canvasRef.current && videoRef.current) {
        const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
        const resized = faceapi.resizeResults(detections, dims);
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        faceapi.draw.drawDetections(canvasRef.current, resized);
      }

      if (detections.length === 0) {
        setCurrentStatus("⚠ No face detected!");
        setStatusColor("text-red-400");
        logViolation("no_face", "No face detected in camera feed");
      } else if (detections.length > 1) {
        setCurrentStatus(`⚠ ${detections.length} faces detected!`);
        setStatusColor("text-red-400");
        logViolation("multiple_faces", `${detections.length} faces detected`);
      } else {
        // Check if looking away using landmarks
        const landmarks = detections[0].landmarks;
        const nose = landmarks.getNose();
        const jaw = landmarks.getJawOutline();
        if (nose && jaw) {
          const noseX = nose[3]?.x || 0;
          const jawLeft = jaw[0]?.x || 0;
          const jawRight = jaw[jaw.length - 1]?.x || 1;
          const faceWidth = jawRight - jawLeft;
          const nosePos = (noseX - jawLeft) / faceWidth;
          if (nosePos < 0.3 || nosePos > 0.7) {
            setCurrentStatus("⚠ Looking away!");
            setStatusColor("text-neon-yellow");
            logViolation("looking_away", "Candidate appears to be looking away");
          } else {
            setCurrentStatus("✓ Face detected — OK");
            setStatusColor("text-neon-green");
          }
        } else {
          setCurrentStatus("✓ Face detected — OK");
          setStatusColor("text-neon-green");
        }
      }
    }, 3000); // Check every 3 seconds
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const getScoreColor = (s) => {
    if (s >= 80) return "text-neon-green";
    if (s >= 50) return "text-neon-yellow";
    return "text-red-400";
  };

  const getScoreBg = (s) => {
    if (s >= 80) return "border-neon-green/50 bg-neon-green/10";
    if (s >= 50) return "border-neon-yellow/50 bg-neon-yellow/10";
    return "border-red-500/50 bg-red-500/10";
  };

  const violationIcons = {
    tab_switch: <Eye size={12} />,
    no_face: <VideoOff size={12} />,
    multiple_faces: <Users size={12} />,
    copy_paste: <AlertTriangle size={12} />,
    window_blur: <Eye size={12} />,
    looking_away: <Eye size={12} />,
  };

  return (
    <div className="glass-panel border border-dark-600 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-2 bg-dark-800 border-b border-dark-600 flex items-center justify-between">
        <h3 className="text-white text-xs font-bold font-orbitron flex items-center gap-2">
          <Shield size={14} className="text-neon-cyan" /> PROCTORING
        </h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${cameraOn ? "bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" : "bg-gray-600"}`} />
          <span className="text-[10px] text-gray-400 font-mono">{cameraOn ? "REC" : "OFF"}</span>
        </div>
      </div>

      {/* Video Feed */}
      <div className="relative bg-dark-900 aspect-video w-full overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover ${cameraOn ? "" : "hidden"}`}
          style={{ transform: "scaleX(-1)" }}
        />
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full ${cameraOn ? "" : "hidden"}`}
          style={{ transform: "scaleX(-1)" }}
        />
        {!cameraOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <VideoOff size={32} className="text-gray-600" />
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 rounded-lg text-xs font-bold font-orbitron hover:bg-neon-cyan/30 transition-all"
            >
              START PROCTORING
            </button>
          </div>
        )}
        {cameraOn && (
          <button
            onClick={stopCamera}
            className="absolute top-2 right-2 p-1.5 bg-dark-900/80 rounded border border-dark-600 hover:border-red-500/50 transition-colors"
          >
            <VideoOff size={12} className="text-red-400" />
          </button>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-3 py-2 border-b border-dark-700 flex items-center justify-between">
        <span className={`text-[11px] font-mono ${statusColor}`}>{currentStatus}</span>
        {cameraOn && (
          <span className="text-[10px] text-gray-500 font-mono">Faces: {faceCount}</span>
        )}
      </div>

      {/* Integrity Score */}
      <div className="px-3 py-2 flex items-center justify-between">
        <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Integrity</span>
        <div className={`px-2 py-0.5 rounded border text-xs font-bold font-orbitron ${getScoreBg(integrityScore)} ${getScoreColor(integrityScore)}`}>
          {integrityScore}/100
        </div>
      </div>

      {/* Integrity Bar */}
      <div className="px-3 pb-2">
        <div className="w-full bg-dark-900 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${integrityScore >= 80 ? "bg-neon-green" : integrityScore >= 50 ? "bg-neon-yellow" : "bg-red-500"}`}
            style={{ width: `${integrityScore}%` }}
          />
        </div>
      </div>

      {/* Violations Count + Toggle */}
      <div className="px-3 py-2 border-t border-dark-700">
        <button
          onClick={() => setShowTimeline(!showTimeline)}
          className="w-full flex items-center justify-between text-xs text-gray-400 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <AlertTriangle size={12} className={violations.length > 0 ? "text-red-400" : "text-gray-600"} />
            {violations.length} Violation{violations.length !== 1 ? "s" : ""}
          </span>
          <span className="text-[10px] font-mono">{showTimeline ? "▲ HIDE" : "▼ SHOW"}</span>
        </button>
      </div>

      {/* Violation Timeline */}
      <AnimatePresence>
        {showTimeline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-dark-700 overflow-hidden"
          >
            <div className="max-h-[200px] overflow-y-auto px-3 py-2 space-y-1.5">
              {violations.length === 0 ? (
                <p className="text-[10px] text-gray-600 text-center py-2 font-mono">No violations recorded</p>
              ) : (
                violations.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-1.5 rounded bg-dark-900/50 border border-dark-700 text-[10px]"
                  >
                    <div className="text-red-400 mt-0.5 flex-shrink-0">{violationIcons[v.type]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-300 truncate">{v.details}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-gray-600">
                        <Clock size={8} />
                        <span>{v.timeStr}</span>
                        <span className="text-red-400">-{v.weight}pts</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Download Recording */}
      {recordedUrl && (
        <div className="px-3 py-2 border-t border-dark-700">
          <a
            href={recordedUrl}
            download="interview_recording.webm"
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-neon-purple/20 text-neon-purple border border-neon-purple/50 rounded text-[10px] font-bold font-orbitron hover:bg-neon-purple/30 transition-all"
          >
            <Video size={12} /> DOWNLOAD RECORDING
          </a>
        </div>
      )}
    </div>
  );
}
