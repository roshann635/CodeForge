import React from 'react';
import { Play, Pause, Square, RotateCcw, Gauge, Footprints } from 'lucide-react';

export default function ControlBar({ isPlaying, isPaused, speed, stepCount, onStart, onPause, onResume, onStop, onReset, onSpeedChange, complexity }) {
  return (
    <div className="flex flex-wrap items-center gap-4 bg-dark-800/90 backdrop-blur-sm border border-dark-600 rounded-xl px-5 py-3">
      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        {!isPlaying ? (
          <button onClick={onStart} className="flex items-center gap-2 bg-neon-cyan/20 hover:bg-neon-cyan/40 text-neon-cyan px-4 py-2 rounded-lg border border-neon-cyan/50 transition-all hover:shadow-[0_0_15px_#00f3ff44] font-medium text-sm">
            <Play size={16} /> Run
          </button>
        ) : isPaused ? (
          <button onClick={onResume} className="flex items-center gap-2 bg-neon-green/20 hover:bg-neon-green/40 text-neon-green px-4 py-2 rounded-lg border border-neon-green/50 transition-all font-medium text-sm">
            <Play size={16} /> Resume
          </button>
        ) : (
          <button onClick={onPause} className="flex items-center gap-2 bg-neon-yellow/20 hover:bg-neon-yellow/40 text-neon-yellow px-4 py-2 rounded-lg border border-neon-yellow/50 transition-all font-medium text-sm">
            <Pause size={16} /> Pause
          </button>
        )}

        <button onClick={onStop} disabled={!isPlaying} className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 px-4 py-2 rounded-lg border border-red-500/50 transition-all font-medium text-sm disabled:opacity-30 disabled:cursor-not-allowed">
          <Square size={16} /> Stop
        </button>

        <button onClick={onReset} className="flex items-center gap-2 bg-dark-700 hover:bg-dark-600 text-gray-300 px-4 py-2 rounded-lg border border-dark-500 transition-all font-medium text-sm">
          <RotateCcw size={16} /> Reset
        </button>
      </div>

      {/* Speed Control */}
      <div className="flex items-center gap-3 ml-auto">
        <Gauge size={16} className="text-neon-purple" />
        <span className="text-xs text-gray-400 font-mono w-14">{speed}ms</span>
        <input
          type="range"
          min="50"
          max="1500"
          step="50"
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="w-28 accent-neon-purple h-1.5 bg-dark-600 rounded-full appearance-none cursor-pointer"
        />
        <div className="flex gap-1 text-[10px] text-gray-500">
          <span>Fast</span>
          <span>—</span>
          <span>Slow</span>
        </div>
      </div>

      {/* Step Counter */}
      <div className="flex items-center gap-2 text-gray-400 text-sm border-l border-dark-600 pl-4">
        <Footprints size={14} className="text-neon-magenta" />
        <span className="font-mono">{stepCount} steps</span>
      </div>

      {/* Complexity Info */}
      {complexity && (
        <div className="hidden lg:flex items-center gap-3 text-xs border-l border-dark-600 pl-4">
          <div className="flex flex-col">
            <span className="text-gray-500">Time</span>
            <span className="text-neon-cyan font-mono">{complexity.time}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500">Space</span>
            <span className="text-neon-magenta font-mono">{complexity.space}</span>
          </div>
        </div>
      )}
    </div>
  );
}
