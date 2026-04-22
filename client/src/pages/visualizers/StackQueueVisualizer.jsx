import React, { useState, useCallback } from 'react';
import ControlBar from './ControlBar';
import useAnimationControl from './useAnimationControl';
import { Plus, Minus } from 'lucide-react';

export default function StackQueueVisualizer() {
  const [mode, setMode] = useState('stack');
  const [items, setItems] = useState([10, 20, 30]);
  const [inputVal, setInputVal] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [highlightTop, setHighlightTop] = useState(false);
  const [removingIndex, setRemovingIndex] = useState(-1);
  const [addingValue, setAddingValue] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const anim = useAnimationControl();

  const delay = useCallback(async (ms = 1) => {
    const result = await anim.sleep(ms);
    if (result === 'cancelled') throw new Error('cancelled');
  }, [anim]);

  const resetHighlights = () => {
    setActiveIndex(-1);
    setHighlightTop(false);
    setRemovingIndex(-1);
    setAddingValue(null);
    setStatusMessage('');
  };

  const push = useCallback(async () => {
    const val = parseInt(inputVal);
    if (isNaN(val)) { setStatusMessage('⚠ Enter a valid number'); return; }
    anim.start();
    resetHighlights();
    try {
      if (mode === 'stack') {
        setStatusMessage(`Pushing ${val} onto the stack...`);
        setAddingValue(val);
        await delay(anim.speed * 1.5);
        setItems(prev => [...prev, val]);
        setAddingValue(null);
        setActiveIndex(items.length);
        setStatusMessage(`✅ Pushed ${val}. Stack size: ${items.length + 1}`);
        anim.incrementStep();
        await delay(anim.speed);
      } else {
        setStatusMessage(`Enqueuing ${val}...`);
        setAddingValue(val);
        await delay(anim.speed * 1.5);
        setItems(prev => [...prev, val]);
        setAddingValue(null);
        setActiveIndex(items.length);
        setStatusMessage(`✅ Enqueued ${val}. Queue size: ${items.length + 1}`);
        anim.incrementStep();
        await delay(anim.speed);
      }
      setActiveIndex(-1);
    } catch (e) { if (e.message !== 'cancelled') console.error(e); }
    anim.finish();
  }, [inputVal, mode, items, anim, delay]);

  const pop = useCallback(async () => {
    if (items.length === 0) { setStatusMessage('⚠ Empty!'); return; }
    anim.start();
    resetHighlights();
    try {
      if (mode === 'stack') {
        const topIdx = items.length - 1;
        setHighlightTop(true);
        setActiveIndex(topIdx);
        setStatusMessage(`Popping top element: ${items[topIdx]}`);
        anim.incrementStep();
        await delay(anim.speed * 1.2);
        setRemovingIndex(topIdx);
        await delay(anim.speed);
        const removed = items[topIdx];
        setItems(prev => prev.slice(0, -1));
        setRemovingIndex(-1);
        setStatusMessage(`✅ Popped ${removed}. Stack size: ${items.length - 1}`);
        await delay(anim.speed * 0.5);
      } else {
        setActiveIndex(0);
        setStatusMessage(`Dequeuing front element: ${items[0]}`);
        anim.incrementStep();
        await delay(anim.speed * 1.2);
        setRemovingIndex(0);
        await delay(anim.speed);
        const removed = items[0];
        setItems(prev => prev.slice(1));
        setRemovingIndex(-1);
        setStatusMessage(`✅ Dequeued ${removed}. Queue size: ${items.length - 1}`);
        await delay(anim.speed * 0.5);
      }
      setActiveIndex(-1);
      setHighlightTop(false);
    } catch (e) { if (e.message !== 'cancelled') console.error(e); }
    anim.finish();
  }, [items, mode, anim, delay]);

  const peek = useCallback(async () => {
    if (items.length === 0) { setStatusMessage('⚠ Empty!'); return; }
    anim.start();
    resetHighlights();
    try {
      const peekIdx = mode === 'stack' ? items.length - 1 : 0;
      setActiveIndex(peekIdx);
      setHighlightTop(true);
      setStatusMessage(`${mode === 'stack' ? 'Top' : 'Front'}: ${items[peekIdx]} (peek — no removal)`);
      anim.incrementStep();
      await delay(anim.speed * 2);
      setActiveIndex(-1);
      setHighlightTop(false);
    } catch (e) { if (e.message !== 'cancelled') console.error(e); }
    anim.finish();
  }, [items, mode, anim, delay]);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Mode Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[['stack', 'Stack (LIFO)'], ['queue', 'Queue (FIFO)']].map(([key, label]) => (
          <button key={key} onClick={() => { setMode(key); resetHighlights(); setItems([10, 20, 30]); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border
              ${mode === key ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50 shadow-[0_0_12px_#00f3ff33]'
                : 'bg-dark-800 text-gray-400 border-dark-600 hover:text-white hover:border-dark-500'}`}>
            {label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <input type="number" value={inputVal} onChange={(e) => setInputVal(e.target.value)}
            placeholder="Value" className="w-20 bg-dark-800 border border-dark-600 text-white px-2 py-1.5 rounded text-sm font-mono focus:border-neon-cyan outline-none" />
          <button onClick={push} className="flex items-center gap-1 px-3 py-1.5 bg-neon-green/20 text-neon-green border border-neon-green/50 rounded-lg text-sm hover:bg-neon-green/30 transition-all">
            <Plus size={14} /> {mode === 'stack' ? 'Push' : 'Enqueue'}
          </button>
          <button onClick={pop} className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg text-sm hover:bg-red-500/30 transition-all">
            <Minus size={14} /> {mode === 'stack' ? 'Pop' : 'Dequeue'}
          </button>
          <button onClick={peek} className="px-3 py-1.5 bg-neon-purple/20 text-neon-purple border border-neon-purple/50 rounded-lg text-sm hover:bg-neon-purple/30 transition-all">
            Peek
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="bg-dark-800/60 border border-dark-700 rounded-lg px-4 py-2 flex items-center justify-between">
        <p className="text-gray-400 text-sm">
          {mode === 'stack' ? 'Stack — Last In, First Out. Push/Pop from the top.' : 'Queue — First In, First Out. Enqueue at back, dequeue from front.'}
        </p>
        <div className="flex gap-4 text-xs">
          <span className="text-gray-500">Push/Enqueue: <span className="text-neon-green font-mono">O(1)</span></span>
          <span className="text-gray-500">Pop/Dequeue: <span className="text-neon-green font-mono">O(1)</span></span>
          <span className="text-gray-500">Peek: <span className="text-neon-green font-mono">O(1)</span></span>
        </div>
      </div>

      {/* Visualization */}
      <div className="flex-1 glass-panel p-8 flex items-center justify-center min-h-[350px] relative overflow-hidden">
        <div className="absolute top-3 left-4 text-xs text-gray-400 font-mono">{statusMessage}</div>
        <div className="absolute top-3 right-4 text-xs text-gray-500 font-mono">Size: {items.length}</div>

        {mode === 'stack' ? (
          /* STACK: vertical, top at top */
          <div className="flex flex-col-reverse items-center gap-1">
            {addingValue !== null && (
              <div className="w-48 py-3 rounded-lg border-2 border-neon-yellow border-dashed bg-neon-yellow/10 text-neon-yellow font-mono font-bold text-center animate-bounce text-lg">
                {addingValue}
              </div>
            )}
            {items.map((item, idx) => {
              const isTop = idx === items.length - 1;
              const isActive = activeIndex === idx;
              const isRemoving = removingIndex === idx;

              let cls = 'border-dark-500 bg-dark-700 text-gray-200';
              if (isRemoving) cls = 'border-red-500 bg-red-500/20 text-red-400 opacity-50 scale-90';
              else if (isActive) cls = 'border-neon-cyan bg-neon-cyan/20 text-neon-cyan shadow-[0_0_15px_#00f3ff44]';
              else if (isTop && highlightTop) cls = 'border-neon-yellow bg-neon-yellow/20 text-neon-yellow';

              return (
                <div key={idx} className={`w-48 py-3 rounded-lg border-2 font-mono font-bold text-center transition-all duration-300 text-lg relative ${cls}`}>
                  {item}
                  {isTop && <span className="absolute -right-16 top-1/2 -translate-y-1/2 text-[10px] text-neon-yellow font-mono">← TOP</span>}
                  {idx === 0 && <span className="absolute -right-20 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 font-mono">← BOTTOM</span>}
                </div>
              );
            })}
            {items.length === 0 && <div className="text-gray-500 text-sm">Empty Stack</div>}
          </div>
        ) : (
          /* QUEUE: horizontal, front at left */
          <div className="flex items-center gap-2">
            <span className="text-neon-green text-xs font-mono mr-2 -rotate-90">FRONT</span>
            {items.map((item, idx) => {
              const isFront = idx === 0;
              const isBack = idx === items.length - 1;
              const isActive = activeIndex === idx;
              const isRemoving = removingIndex === idx;

              let cls = 'border-dark-500 bg-dark-700 text-gray-200';
              if (isRemoving) cls = 'border-red-500 bg-red-500/20 text-red-400 opacity-50 scale-90';
              else if (isActive) cls = 'border-neon-cyan bg-neon-cyan/20 text-neon-cyan shadow-[0_0_15px_#00f3ff44]';

              return (
                <div key={idx} className={`w-16 h-20 rounded-lg border-2 font-mono font-bold flex flex-col items-center justify-center transition-all duration-300 ${cls}`}>
                  <span className="text-lg">{item}</span>
                  <span className="text-[9px] opacity-50">{idx}</span>
                </div>
              );
            })}
            {addingValue !== null && (
              <div className="w-16 h-20 rounded-lg border-2 border-neon-yellow border-dashed bg-neon-yellow/10 text-neon-yellow font-mono font-bold flex items-center justify-center animate-bounce text-lg">
                {addingValue}
              </div>
            )}
            <span className="text-neon-purple text-xs font-mono ml-2 -rotate-90">BACK</span>
            {items.length === 0 && <div className="text-gray-500 text-sm">Empty Queue</div>}
          </div>
        )}
      </div>

      {/* Controls */}
      <ControlBar
        isPlaying={anim.isPlaying} isPaused={anim.isPaused} speed={anim.speed}
        stepCount={anim.stepCount}
        onStart={push} onPause={anim.pause} onResume={anim.resume}
        onStop={anim.stop} onReset={() => { resetHighlights(); setItems([10, 20, 30]); }}
        onSpeedChange={anim.setSpeed}
        complexity={{ time: 'O(1)', space: 'O(n)' }}
      />
    </div>
  );
}
