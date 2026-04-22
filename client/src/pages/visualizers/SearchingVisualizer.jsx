import React, { useState, useCallback, useRef, useEffect } from 'react';
import ControlBar from './ControlBar';
import useAnimationControl from './useAnimationControl';
import { Shuffle } from 'lucide-react';

const ALGORITHMS = {
  linear: { name: 'Linear Search', time: 'O(n)', space: 'O(1)', best: 'O(1)', description: 'Sequentially checks each element until the target is found.' },
  binary: { name: 'Binary Search', time: 'O(log n)', space: 'O(1)', best: 'O(1)', description: 'Efficiently searches a sorted array by halving the search space.' },
};

function generateSortedArray(size) {
  const arr = [];
  let val = Math.floor(Math.random() * 5) + 1;
  for (let i = 0; i < size; i++) {
    arr.push(val);
    val += Math.floor(Math.random() * 8) + 1;
  }
  return arr;
}

export default function SearchingVisualizer() {
  const [algorithm, setAlgorithm] = useState('binary');
  const [array, setArray] = useState(() => generateSortedArray(20));
  const [target, setTarget] = useState('');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [left, setLeft] = useState(-1);
  const [right, setRight] = useState(-1);
  const [mid, setMid] = useState(-1);
  const [foundIndex, setFoundIndex] = useState(-1);
  const [visited, setVisited] = useState([]);
  const [eliminated, setEliminated] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');

  const anim = useAnimationControl();

  const resetVisualization = useCallback(() => {
    anim.stop();
    setCurrentIndex(-1);
    setLeft(-1);
    setRight(-1);
    setMid(-1);
    setFoundIndex(-1);
    setVisited([]);
    setEliminated([]);
    setStatusMessage('');
  }, [anim]);

  const handleNewArray = () => {
    resetVisualization();
    const newArr = generateSortedArray(20);
    setArray(newArr);
    setTarget('');
  };

  const delay = useCallback(async (ms = 1) => {
    const result = await anim.sleep(ms);
    if (result === 'cancelled') throw new Error('cancelled');
  }, [anim]);

  const linearSearch = useCallback(async () => {
    const t = parseInt(target);
    if (isNaN(t)) { setStatusMessage('⚠ Enter a valid target number'); anim.finish(); return; }
    
    for (let i = 0; i < array.length; i++) {
      setCurrentIndex(i);
      setVisited(prev => [...prev, i]);
      setStatusMessage(`Checking index ${i}: ${array[i]} === ${t}?`);
      anim.incrementStep();
      await delay(anim.speed);
      
      if (array[i] === t) {
        setFoundIndex(i);
        setStatusMessage(`✅ Found ${t} at index ${i}!`);
        return;
      }
    }
    setStatusMessage(`❌ ${t} not found in the array.`);
    setCurrentIndex(-1);
  }, [array, target, anim, delay]);

  const binarySearch = useCallback(async () => {
    const t = parseInt(target);
    if (isNaN(t)) { setStatusMessage('⚠ Enter a valid target number'); anim.finish(); return; }

    let lo = 0, hi = array.length - 1;
    setLeft(lo);
    setRight(hi);

    while (lo <= hi) {
      const m = Math.floor((lo + hi) / 2);
      setMid(m);
      setLeft(lo);
      setRight(hi);
      setStatusMessage(`left=${lo}, right=${hi}, mid=${m} → array[${m}]=${array[m]}, target=${t}`);
      anim.incrementStep();
      await delay(anim.speed * 1.5);

      if (array[m] === t) {
        setFoundIndex(m);
        setStatusMessage(`✅ Found ${t} at index ${m}!`);
        return;
      } else if (array[m] < t) {
        // Eliminate left portion
        for (let i = lo; i <= m; i++) setEliminated(prev => [...prev, i]);
        setStatusMessage(`${array[m]} < ${t} → search right half`);
        await delay(anim.speed);
        lo = m + 1;
      } else {
        // Eliminate right portion
        for (let i = m; i <= hi; i++) setEliminated(prev => [...prev, i]);
        setStatusMessage(`${array[m]} > ${t} → search left half`);
        await delay(anim.speed);
        hi = m - 1;
      }
    }
    setStatusMessage(`❌ ${t} not found in the array.`);
    setMid(-1);
    setLeft(-1);
    setRight(-1);
  }, [array, target, anim, delay]);

  const runAlgorithm = async () => {
    resetVisualization();
    anim.start();
    try {
      if (algorithm === 'linear') await linearSearch();
      else await binarySearch();
    } catch (e) {
      if (e.message !== 'cancelled') console.error(e);
      setStatusMessage('Stopped.');
    }
    anim.finish();
  };

  const info = ALGORITHMS[algorithm];

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Algorithm Tabs */}
      <div className="flex items-center gap-2">
        {Object.entries(ALGORITHMS).map(([key, val]) => (
          <button
            key={key}
            onClick={() => { setAlgorithm(key); resetVisualization(); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border
              ${algorithm === key
                ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50 shadow-[0_0_12px_#00f3ff33]'
                : 'bg-dark-800 text-gray-400 border-dark-600 hover:text-white hover:border-dark-500'}`}
          >
            {val.name}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Target:</label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. 23"
              className="w-20 bg-dark-800 border border-dark-600 text-white px-2 py-1.5 rounded text-sm font-mono focus:border-neon-cyan outline-none"
            />
          </div>
          <button onClick={handleNewArray} className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg text-sm border border-dark-600 transition-all">
            <Shuffle size={14} /> New Array
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="bg-dark-800/60 border border-dark-700 rounded-lg px-4 py-2 flex items-center justify-between">
        <p className="text-gray-400 text-sm">{info.description}</p>
        <div className="flex gap-4 text-xs">
          <span className="text-gray-500">Best: <span className="text-neon-green font-mono">{info.best}</span></span>
          <span className="text-gray-500">Worst: <span className="text-neon-yellow font-mono">{info.time}</span></span>
        </div>
      </div>

      {/* Array Cells Visualization */}
      <div className="flex-1 glass-panel p-8 flex flex-col items-center justify-center min-h-[350px] relative overflow-hidden">
        <div className="absolute top-3 left-4 text-xs text-gray-400 font-mono">{statusMessage}</div>

        {/* Binary Search Pointers */}
        {algorithm === 'binary' && left >= 0 && right >= 0 && (
          <div className="flex gap-[2px] mb-2 w-full justify-center">
            {array.map((_, idx) => (
              <div key={idx} className="flex flex-col items-center" style={{ width: `${Math.min(100/array.length, 5)}%`, minWidth: '30px', maxWidth: '60px' }}>
                {idx === left && <span className="text-neon-green text-[10px] font-mono font-bold animate-bounce">L</span>}
                {idx === mid && <span className="text-neon-yellow text-[10px] font-mono font-bold animate-bounce">M</span>}
                {idx === right && <span className="text-neon-magenta text-[10px] font-mono font-bold animate-bounce">R</span>}
                {idx !== left && idx !== mid && idx !== right && <span className="text-transparent text-[10px]">-</span>}
              </div>
            ))}
          </div>
        )}

        {/* Array Cells */}
        <div className="flex gap-[2px] w-full justify-center">
          {array.map((val, idx) => {
            const isFound = foundIndex === idx;
            const isCurrent = currentIndex === idx;
            const isMid = mid === idx;
            const isVisited = visited.includes(idx);
            const isEliminated = eliminated.includes(idx);
            const isInRange = algorithm === 'binary' && idx >= left && idx <= right && left >= 0;

            let cellClass = 'bg-dark-700 border-dark-500 text-gray-300';
            if (isFound) cellClass = 'bg-neon-green/30 border-neon-green text-neon-green shadow-[0_0_15px_#39ff1466] scale-110';
            else if (isCurrent || isMid) cellClass = 'bg-neon-yellow/30 border-neon-yellow text-neon-yellow shadow-[0_0_12px_#fbff0044]';
            else if (isEliminated) cellClass = 'bg-dark-900 border-dark-800 text-gray-600 opacity-40';
            else if (isVisited) cellClass = 'bg-neon-purple/20 border-neon-purple/50 text-neon-purple';
            else if (isInRange) cellClass = 'bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan';

            return (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center border rounded-lg transition-all duration-300 ${cellClass}`}
                style={{ width: `${Math.min(100/array.length, 5)}%`, minWidth: '30px', maxWidth: '60px', height: '60px' }}
              >
                <span className="font-mono font-bold text-sm">{val}</span>
                <span className="text-[9px] opacity-50">{idx}</span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="absolute bottom-2 right-3 flex items-center gap-3 text-[10px] text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-neon-cyan/30 border border-neon-cyan/50 inline-block"></span> In Range</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-neon-yellow inline-block"></span> Current</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-dark-900 inline-block"></span> Eliminated</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-neon-green inline-block"></span> Found</span>
        </div>
      </div>

      {/* Controls */}
      <ControlBar
        isPlaying={anim.isPlaying} isPaused={anim.isPaused} speed={anim.speed}
        stepCount={anim.stepCount}
        onStart={runAlgorithm} onPause={anim.pause} onResume={anim.resume}
        onStop={anim.stop} onReset={resetVisualization}
        onSpeedChange={anim.setSpeed}
        complexity={{ time: info.time, space: info.space }}
      />
    </div>
  );
}
