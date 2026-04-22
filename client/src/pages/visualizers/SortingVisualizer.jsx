import React, { useState, useEffect, useCallback, useRef } from 'react';
import ControlBar from './ControlBar';
import useAnimationControl from './useAnimationControl';
import { Shuffle, SlidersHorizontal, BrainCircuit, Activity } from 'lucide-react';

const ALGORITHMS = {
  bubble: { name: 'Bubble Sort', time: 'O(n²)', space: 'O(1)', best: 'O(n)', description: 'Repeatedly swaps adjacent elements if they are in wrong order.' },
  selection: { name: 'Selection Sort', time: 'O(n²)', space: 'O(1)', best: 'O(n²)', description: 'Finds the minimum element and places it at the beginning.' },
  insertion: { name: 'Insertion Sort', time: 'O(n²)', space: 'O(1)', best: 'O(n)', description: 'Builds sorted array one item at a time by insertion.' },
  merge: { name: 'Merge Sort', time: 'O(n log n)', space: 'O(n)', best: 'O(n log n)', description: 'Divides array in half, sorts each half, then merges them.' },
  quick: { name: 'Quick Sort', time: 'O(n log n)', space: 'O(log n)', best: 'O(n log n)', description: 'Picks a pivot, partitions around it, recursively sorts partitions.' },
};

function generateArray(size) {
  const arr = [];
  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * 90) + 10);
  }
  return arr;
}

export default function SortingVisualizer() {
  const [algorithm, setAlgorithm] = useState('bubble');
  const [arraySize, setArraySize] = useState(25);
  const [array, setArray] = useState(() => generateArray(25));
  const [activeIndices, setActiveIndices] = useState([]);
  const [sortedIndices, setSortedIndices] = useState([]);
  const [pivotIndex, setPivotIndex] = useState(-1);
  const [comparing, setComparing] = useState([]);
  const [swapping, setSwapping] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');

  const anim = useAnimationControl();
  const arrayRef = useRef(array);

  useEffect(() => { arrayRef.current = array; }, [array]);

  const resetVisualization = useCallback(() => {
    anim.stop();
    const newArr = generateArray(arraySize);
    setArray(newArr);
    setActiveIndices([]);
    setSortedIndices([]);
    setPivotIndex(-1);
    setComparing([]);
    setSwapping([]);
    setStatusMessage('');
  }, [arraySize, anim]);

  const handleNewArray = () => {
    resetVisualization();
  };

  const delay = useCallback(async (ms = 1) => {
    const result = await anim.sleep(ms);
    if (result === 'cancelled') throw new Error('cancelled');
  }, [anim]);

  // ================================================
  // BUBBLE SORT
  // ================================================
  const bubbleSort = useCallback(async () => {
    let arr = [...arrayRef.current];
    const n = arr.length;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        setComparing([j, j + 1]);
        setStatusMessage(`Comparing index ${j} and ${j + 1}`);
        anim.incrementStep();
        await delay(anim.speed);
        if (arr[j] > arr[j + 1]) {
          setSwapping([j, j + 1]);
          setStatusMessage(`Swapping ${arr[j]} and ${arr[j + 1]}`);
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setArray([...arr]);
          await delay(anim.speed * 0.6);
          setSwapping([]);
        }
        setComparing([]);
      }
      setSortedIndices(prev => [...prev, n - i - 1]);
    }
  }, [anim, delay]);

  // ================================================
  // SELECTION SORT
  // ================================================
  const selectionSort = useCallback(async () => {
    let arr = [...arrayRef.current];
    const n = arr.length;
    for (let i = 0; i < n; i++) {
      let minIdx = i;
      setActiveIndices([i]);
      setStatusMessage(`Finding minimum from index ${i} to ${n - 1}`);
      for (let j = i + 1; j < n; j++) {
        setComparing([minIdx, j]);
        anim.incrementStep();
        await delay(anim.speed);
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          setActiveIndices([minIdx]);
        }
      }
      if (minIdx !== i) {
        setSwapping([i, minIdx]);
        setStatusMessage(`Swapping index ${i} (${arr[i]}) with min at ${minIdx} (${arr[minIdx]})`);
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        setArray([...arr]);
        await delay(anim.speed * 0.6);
        setSwapping([]);
      }
      setSortedIndices(prev => [...prev, i]);
      setComparing([]);
      setActiveIndices([]);
    }
  }, [anim, delay]);

  // ================================================
  // INSERTION SORT
  // ================================================
  const insertionSort = useCallback(async () => {
    let arr = [...arrayRef.current];
    const n = arr.length;
    setSortedIndices([0]);
    for (let i = 1; i < n; i++) {
      let key = arr[i];
      let j = i - 1;
      setActiveIndices([i]);
      setStatusMessage(`Inserting ${key} into sorted position`);
      anim.incrementStep();
      await delay(anim.speed);
      while (j >= 0 && arr[j] > key) {
        setComparing([j, j + 1]);
        setSwapping([j, j + 1]);
        arr[j + 1] = arr[j];
        setArray([...arr]);
        anim.incrementStep();
        await delay(anim.speed * 0.5);
        j--;
      }
      arr[j + 1] = key;
      setArray([...arr]);
      setSortedIndices(prev => [...new Set([...prev, i])]);
      setComparing([]);
      setSwapping([]);
      setActiveIndices([]);
      await delay(anim.speed * 0.3);
    }
    setSortedIndices(arr.map((_, i) => i));
  }, [anim, delay]);

  // ================================================
  // MERGE SORT
  // ================================================
  const mergeSort = useCallback(async () => {
    let arr = [...arrayRef.current];

    async function merge(arr, l, m, r) {
      let left = arr.slice(l, m + 1);
      let right = arr.slice(m + 1, r + 1);
      let i = 0, j = 0, k = l;

      while (i < left.length && j < right.length) {
        setComparing([l + i, m + 1 + j]);
        setStatusMessage(`Merging: comparing ${left[i]} and ${right[j]}`);
        anim.incrementStep();
        await delay(anim.speed);
        if (left[i] <= right[j]) {
          arr[k] = left[i];
          i++;
        } else {
          arr[k] = right[j];
          j++;
        }
        setArray([...arr]);
        setActiveIndices(Array.from({ length: r - l + 1 }, (_, idx) => l + idx));
        k++;
      }

      while (i < left.length) {
        arr[k] = left[i]; i++; k++;
        setArray([...arr]);
        await delay(anim.speed * 0.3);
      }
      while (j < right.length) {
        arr[k] = right[j]; j++; k++;
        setArray([...arr]);
        await delay(anim.speed * 0.3);
      }
      setComparing([]);
    }

    async function sort(arr, l, r) {
      if (l < r) {
        let m = Math.floor((l + r) / 2);
        await sort(arr, l, m);
        await sort(arr, m + 1, r);
        await merge(arr, l, m, r);
      }
    }

    await sort(arr, 0, arr.length - 1);
    setSortedIndices(arr.map((_, i) => i));
    setActiveIndices([]);
  }, [anim, delay]);

  // ================================================
  // QUICK SORT
  // ================================================
  const quickSort = useCallback(async () => {
    let arr = [...arrayRef.current];

    async function partition(arr, low, high) {
      let pivot = arr[high];
      setPivotIndex(high);
      setStatusMessage(`Pivot: ${pivot} at index ${high}`);
      let i = low - 1;

      for (let j = low; j < high; j++) {
        setComparing([j, high]);
        anim.incrementStep();
        await delay(anim.speed);
        if (arr[j] < pivot) {
          i++;
          setSwapping([i, j]);
          [arr[i], arr[j]] = [arr[j], arr[i]];
          setArray([...arr]);
          await delay(anim.speed * 0.5);
          setSwapping([]);
        }
        setComparing([]);
      }
      setSwapping([i + 1, high]);
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      setArray([...arr]);
      await delay(anim.speed * 0.5);
      setSwapping([]);
      setSortedIndices(prev => [...prev, i + 1]);
      return i + 1;
    }

    async function sort(arr, low, high) {
      if (low < high) {
        let pi = await partition(arr, low, high);
        await sort(arr, low, pi - 1);
        await sort(arr, pi + 1, high);
      } else if (low === high) {
        setSortedIndices(prev => [...prev, low]);
      }
    }

    await sort(arr, 0, arr.length - 1);
    setSortedIndices(arr.map((_, i) => i));
    setPivotIndex(-1);
  }, [anim, delay]);

  const runAlgorithm = async () => {
    anim.start();
    setSortedIndices([]);
    setComparing([]);
    setSwapping([]);
    setActiveIndices([]);
    setPivotIndex(-1);
    setStatusMessage('Starting...');

    try {
      switch (algorithm) {
        case 'bubble': await bubbleSort(); break;
        case 'selection': await selectionSort(); break;
        case 'insertion': await insertionSort(); break;
        case 'merge': await mergeSort(); break;
        case 'quick': await quickSort(); break;
      }
      setStatusMessage('✅ Sorting complete!');
    } catch (e) {
      if (e.message !== 'cancelled') console.error(e);
      setStatusMessage('Stopped.');
    }
    anim.finish();
  };

  const maxVal = Math.max(...array);
  const info = ALGORITHMS[algorithm];

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Algorithm Selector */}
      <div className="flex flex-wrap items-center gap-2">
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
            <SlidersHorizontal size={14} className="text-gray-500" />
            <span className="text-xs text-gray-500">Size: {arraySize}</span>
            <input
              type="range" min="5" max="60" value={arraySize}
              onChange={(e) => { setArraySize(Number(e.target.value)); }}
              onMouseUp={() => resetVisualization()}
              className="w-24 accent-neon-purple h-1 cursor-pointer"
            />
          </div>
          <button onClick={handleNewArray} className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg text-sm border border-dark-600 transition-all">
            <Shuffle size={14} /> Randomize
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="bg-dark-800/60 border border-dark-700 rounded-lg px-4 py-3 flex items-center justify-between gap-4">
        <p className="text-gray-400 text-sm flex-1">{info.description}</p>
        
        {/* Time Complexity SVG Visualizer */}
        <div className="flex items-center gap-6 bg-dark-900/80 p-2.5 rounded-lg border border-dark-600">
          <div className="flex flex-col gap-1 text-xs">
            <span className="text-gray-500">Best: <span className="text-neon-green font-mono">{info.best}</span></span>
            <span className="text-gray-500">Avg/Worst: <span className="text-neon-yellow font-mono">{info.time}</span></span>
            <span className="text-gray-500">Space: <span className="text-neon-cyan font-mono">{info.space}</span></span>
          </div>
          <div className="relative w-12 h-10 border-l border-b border-gray-600 ml-2" title="Time Complexity Curve">
             <span className="absolute -left-3 -top-2 text-[8px] text-gray-500">T</span>
             <span className="absolute -bottom-3 right-0 text-[8px] text-gray-500">N</span>
             <svg width="48" height="40" className="absolute bottom-0 left-0 overflow-visible">
               <path 
                 d={info.time.includes('n²') ? "M 0 40 Q 30 40 48 0" : "M 0 40 Q 35 25 48 10"} 
                 fill="none" 
                 stroke={info.time.includes('n²') ? "#ef4444" : "#00f3ff"} 
                 strokeWidth="2.5" 
                 strokeLinecap="round" 
                 className="drop-shadow-[0_0_3px_currentColor]"
               />
             </svg>
          </div>
        </div>
      </div>

      {/* Bar Visualization */}
      <div className="flex-1 glass-panel flex items-end justify-center gap-[2px] p-6 pt-8 relative min-h-[350px] overflow-hidden">
        {/* Thinking Overlay / AI Tooltip */}
        {(anim.isPlaying || statusMessage) && statusMessage && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-dark-900/95 border border-neon-cyan/50 p-2.5 px-4 rounded-full shadow-[0_0_20px_rgba(0,243,255,0.15)] animate-fade-in flex items-center gap-3 z-20 backdrop-blur-md min-w-[300px]">
             <div className="bg-neon-cyan/10 rounded-full p-1.5 flex-shrink-0">
                <BrainCircuit size={16} className="text-neon-cyan animate-pulse" />
             </div>
             <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-0.5">
                   <p className="text-[9px] font-bold text-neon-cyan uppercase tracking-wider">AI Thinking Trace</p>
                </div>
                <p className="text-xs text-gray-200 font-medium truncate">{statusMessage}</p>
             </div>
          </div>
        )}

        {/* Status Message (Fallback removed) */}

        {array.map((val, idx) => {
          const isSorted = sortedIndices.includes(idx);
          const isComparing = comparing.includes(idx);
          const isSwapping = swapping.includes(idx);
          const isActive = activeIndices.includes(idx);
          const isPivot = pivotIndex === idx;
          const heightPercent = (val / maxVal) * 100;

          let barColor = 'bg-gradient-to-t from-neon-cyan/80 to-neon-cyan';
          if (isPivot) barColor = 'bg-gradient-to-t from-neon-yellow/80 to-neon-yellow';
          else if (isSwapping) barColor = 'bg-gradient-to-t from-red-500/80 to-red-500';
          else if (isComparing) barColor = 'bg-gradient-to-t from-neon-magenta/80 to-neon-magenta';
          else if (isActive) barColor = 'bg-gradient-to-t from-neon-purple/80 to-neon-purple';
          else if (isSorted) barColor = 'bg-gradient-to-t from-neon-green/80 to-neon-green';

          let shadow = '';
          if (isPivot) shadow = 'shadow-[0_0_12px_#fbff0066]';
          else if (isSwapping) shadow = 'shadow-[0_0_12px_#ef444466]';
          else if (isComparing) shadow = 'shadow-[0_0_12px_#ff00ea44]';
          else if (isSorted) shadow = 'shadow-[0_0_8px_#39ff1444]';

          return (
            <div
              key={idx}
              className={`transition-all duration-200 rounded-t-sm ${barColor} ${shadow} relative group`}
              style={{
                height: `${heightPercent}%`,
                width: `${Math.max(100 / array.length - 1, 3)}%`,
                minWidth: '3px',
              }}
            >
              {array.length <= 30 && (
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-gray-400">
                  {val}
                </span>
              )}
            </div>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-2 right-3 flex items-center gap-3 text-[10px] text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-neon-cyan inline-block"></span> Default</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-neon-magenta inline-block"></span> Comparing</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block"></span> Swapping</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-neon-yellow inline-block"></span> Pivot</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-neon-green inline-block"></span> Sorted</span>
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
