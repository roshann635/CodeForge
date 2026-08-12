import React, { useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Upload } from 'lucide-react';

export const ControlBar = ({ 
  isPlaying, 
  togglePlay, 
  stepForward, 
  stepBack, 
  reset, 
  isFinished, 
  isStarted,
  speed, 
  setSpeed,
  onLoadCustomInput
}) => {
  const [customInput, setCustomInput] = useState('');

  const handleLoad = () => {
    if (!customInput.trim()) return;
    const values = customInput.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    if (values.length > 0) {
      onLoadCustomInput(values);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLoad();
  };

  return (
    <div className="control-bar">
      <div className="control-bar-group">
        <button 
          className={`control-btn ${isPlaying ? 'playing' : ''}`}
          onClick={togglePlay}
          title={isPlaying ? "Pause (Space)" : (isFinished ? "Restart (Space)" : "Play (Space)")}
        >
          {isPlaying ? <Pause size={18} /> : (isFinished ? <RotateCcw size={18} /> : <Play size={18} />)}
        </button>
        <button 
          className="control-btn"
          onClick={stepBack}
          disabled={!isStarted || isPlaying}
          title="Step Back (Left Arrow)"
        >
          <SkipBack size={18} />
        </button>
        <button 
          className="control-btn"
          onClick={stepForward}
          disabled={isFinished || isPlaying}
          title="Step Forward (Right Arrow)"
        >
          <SkipForward size={18} />
        </button>
        <button 
          className="control-btn"
          onClick={reset}
          disabled={!isStarted && !isFinished}
          title="Reset (R)"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      <div className="speed-slider">
        <span>Slow</span>
        <input 
          type="range" 
          min="1" 
          max="10" 
          value={speed} 
          onChange={(e) => setSpeed(parseInt(e.target.value, 10))}
          title={`Speed: ${speed}x`}
        />
        <span>Fast</span>
      </div>

      <div className="input-field">
        <input 
          type="text" 
          placeholder="e.g. 38, 27, 43, 3, 9, 82" 
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="load-btn" onClick={handleLoad}>
          <Upload size={14} style={{ display: 'inline-block', marginRight: '4px', verticalAlign: 'text-bottom' }} />
          Load
        </button>
      </div>
    </div>
  );
};
