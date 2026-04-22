import React, { useState, useCallback } from 'react';
import ControlBar from './ControlBar';
import useAnimationControl from './useAnimationControl';
import { Plus, Minus } from 'lucide-react';

function getTreeLayout(arr) {
  const nodes = [];
  const edges = [];
  if (arr.length === 0) return { nodes, edges };
  
  const maxDepth = Math.floor(Math.log2(arr.length)) + 1;
  const totalWidth = 700;
  
  for (let i = 0; i < arr.length; i++) {
    const depth = Math.floor(Math.log2(i + 1));
    const posInLevel = i - (Math.pow(2, depth) - 1);
    const nodesInLevel = Math.pow(2, depth);
    const spacing = totalWidth / (nodesInLevel + 1);
    const x = spacing * (posInLevel + 1) + 50;
    const y = depth * 80 + 50;
    
    nodes.push({ idx: i, val: arr[i], x, y });
    
    const leftChild = 2 * i + 1;
    const rightChild = 2 * i + 2;
    if (leftChild < arr.length) {
      edges.push({ from: i, to: leftChild });
    }
    if (rightChild < arr.length) {
      edges.push({ from: i, to: rightChild });
    }
  }
  return { nodes, edges };
}

export default function HeapVisualizer() {
  const [heap, setHeap] = useState([5, 10, 15, 20, 30, 25, 35]);
  const [heapType, setHeapType] = useState('min');
  const [inputVal, setInputVal] = useState('');
  const [activeIndices, setActiveIndices] = useState([]);
  const [swapping, setSwapping] = useState([]);
  const [extracting, setExtracting] = useState(-1);
  const [statusMessage, setStatusMessage] = useState('');

  const anim = useAnimationControl();

  const delay = useCallback(async (ms = 1) => {
    const result = await anim.sleep(ms);
    if (result === 'cancelled') throw new Error('cancelled');
  }, [anim]);

  const resetHighlights = () => {
    setActiveIndices([]);
    setSwapping([]);
    setExtracting(-1);
    setStatusMessage('');
  };

  const shouldSwap = (parentVal, childVal) => {
    return heapType === 'min' ? childVal < parentVal : childVal > parentVal;
  };

  const insertValue = useCallback(async () => {
    const val = parseInt(inputVal);
    if (isNaN(val)) { setStatusMessage('⚠ Enter a valid number'); return; }
    anim.start();
    resetHighlights();
    try {
      let arr = [...heap, val];
      setHeap([...arr]);
      let i = arr.length - 1;
      setActiveIndices([i]);
      setStatusMessage(`Inserted ${val} at index ${i}. Bubbling up...`);
      anim.incrementStep();
      await delay(anim.speed);

      // Bubble up
      while (i > 0) {
        const parent = Math.floor((i - 1) / 2);
        setActiveIndices([i, parent]);
        setStatusMessage(`Comparing ${arr[i]} with parent ${arr[parent]}`);
        anim.incrementStep();
        await delay(anim.speed);

        if (shouldSwap(arr[parent], arr[i])) {
          setSwapping([i, parent]);
          setStatusMessage(`Swapping ${arr[i]} ↔ ${arr[parent]}`);
          [arr[i], arr[parent]] = [arr[parent], arr[i]];
          setHeap([...arr]);
          await delay(anim.speed * 0.8);
          setSwapping([]);
          i = parent;
        } else {
          setStatusMessage(`${arr[i]} is in correct position (no swap needed)`);
          break;
        }
      }
      setStatusMessage(`✅ Inserted ${val}. Heap property restored.`);
      setActiveIndices([]);
    } catch (e) { if (e.message !== 'cancelled') console.error(e); }
    anim.finish();
  }, [inputVal, heap, heapType, anim, delay]);

  const extractRoot = useCallback(async () => {
    if (heap.length === 0) { setStatusMessage('⚠ Heap is empty!'); return; }
    anim.start();
    resetHighlights();
    try {
      let arr = [...heap];
      const rootVal = arr[0];
      setExtracting(0);
      setStatusMessage(`Extracting ${heapType === 'min' ? 'min' : 'max'}: ${rootVal}`);
      anim.incrementStep();
      await delay(anim.speed * 1.2);

      // Move last to root
      arr[0] = arr[arr.length - 1];
      arr.pop();
      setHeap([...arr]);
      setExtracting(-1);
      setStatusMessage(`Moved last element ${arr[0]} to root. Heapifying down...`);
      await delay(anim.speed);

      // Heapify down
      let i = 0;
      while (true) {
        let target = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        setActiveIndices([i]);
        anim.incrementStep();
        await delay(anim.speed * 0.5);

        if (left < arr.length && shouldSwap(arr[target], arr[left])) target = left;
        if (right < arr.length && shouldSwap(arr[target], arr[right])) target = right;

        if (target !== i) {
          setSwapping([i, target]);
          setStatusMessage(`Swapping ${arr[i]} ↔ ${arr[target]}`);
          [arr[i], arr[target]] = [arr[target], arr[i]];
          setHeap([...arr]);
          await delay(anim.speed * 0.8);
          setSwapping([]);
          i = target;
        } else {
          break;
        }
      }
      setStatusMessage(`✅ Extracted ${rootVal}. Heap property restored.`);
      setActiveIndices([]);
    } catch (e) { if (e.message !== 'cancelled') console.error(e); }
    anim.finish();
  }, [heap, heapType, anim, delay]);

  const layout = getTreeLayout(heap);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {[['min', 'Min-Heap'], ['max', 'Max-Heap']].map(([key, label]) => (
          <button key={key} onClick={() => { setHeapType(key); resetHighlights(); 
            setHeap(key === 'min' ? [5, 10, 15, 20, 30, 25, 35] : [35, 25, 30, 20, 15, 10, 5]); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border
              ${heapType === key ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50 shadow-[0_0_12px_#00f3ff33]'
                : 'bg-dark-800 text-gray-400 border-dark-600 hover:text-white hover:border-dark-500'}`}>
            {label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <input type="number" value={inputVal} onChange={(e) => setInputVal(e.target.value)}
            placeholder="Value" className="w-20 bg-dark-800 border border-dark-600 text-white px-2 py-1.5 rounded text-sm font-mono focus:border-neon-cyan outline-none" />
          <button onClick={insertValue} className="flex items-center gap-1 px-3 py-1.5 bg-neon-green/20 text-neon-green border border-neon-green/50 rounded-lg text-sm hover:bg-neon-green/30 transition-all">
            <Plus size={14} /> Insert
          </button>
          <button onClick={extractRoot} className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg text-sm hover:bg-red-500/30 transition-all">
            <Minus size={14} /> Extract {heapType === 'min' ? 'Min' : 'Max'}
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="bg-dark-800/60 border border-dark-700 rounded-lg px-4 py-2 flex items-center justify-between">
        <p className="text-gray-400 text-sm">{heapType === 'min' ? 'Min-Heap: parent ≤ children' : 'Max-Heap: parent ≥ children'}. Stored as a complete binary tree in an array.</p>
        <div className="flex gap-4 text-xs">
          <span className="text-gray-500">Insert: <span className="text-neon-yellow font-mono">O(log n)</span></span>
          <span className="text-gray-500">Extract: <span className="text-neon-yellow font-mono">O(log n)</span></span>
          <span className="text-gray-500">Peek: <span className="text-neon-green font-mono">O(1)</span></span>
        </div>
      </div>

      {/* Split View: Tree + Array */}
      <div className="flex-1 flex flex-col gap-3">
        {/* Tree View */}
        <div className="flex-1 glass-panel relative min-h-[280px] overflow-hidden">
          <div className="absolute top-3 left-4 text-xs text-gray-400 font-mono z-10">{statusMessage}</div>

          <svg width="100%" height="100%" viewBox="0 0 800 400" className="absolute inset-0">
            {layout.edges.map((edge, i) => {
              const fromNode = layout.nodes[edge.from];
              const toNode = layout.nodes[edge.to];
              const isSwappingEdge = swapping.includes(edge.from) && swapping.includes(edge.to);
              return (
                <line key={i} x1={fromNode.x} y1={fromNode.y + 20} x2={toNode.x} y2={toNode.y}
                  stroke={isSwappingEdge ? '#ff00ea' : '#2a2a3a'} strokeWidth={isSwappingEdge ? 2.5 : 1.5}
                  className="transition-all duration-300" />
              );
            })}
            {layout.nodes.map((node) => {
              const isActive = activeIndices.includes(node.idx);
              const isSwap = swapping.includes(node.idx);
              const isExtract = extracting === node.idx;
              const isRoot = node.idx === 0;

              let fill = '#1a1a24';
              let stroke = '#2a2a3a';
              let textFill = '#d1d5db';
              let glow = '';

              if (isExtract) { fill = '#ef444422'; stroke = '#ef4444'; textFill = '#ef4444'; glow = 'drop-shadow(0 0 12px #ef4444)'; }
              else if (isSwap) { fill = '#ff00ea22'; stroke = '#ff00ea'; textFill = '#ff00ea'; glow = 'drop-shadow(0 0 10px #ff00ea)'; }
              else if (isActive) { fill = '#00f3ff22'; stroke = '#00f3ff'; textFill = '#00f3ff'; glow = 'drop-shadow(0 0 8px #00f3ff)'; }
              else if (isRoot) { fill = '#fbff0011'; stroke = '#fbff0066'; textFill = '#fbff00'; }

              return (
                <g key={node.idx} style={{ filter: glow }} className="transition-all duration-300">
                  <circle cx={node.x} cy={node.y + 20} r={22} fill={fill} stroke={stroke} strokeWidth={2} />
                  <text x={node.x} y={node.y + 26} textAnchor="middle" fill={textFill}
                    fontSize="14" fontFamily="monospace" fontWeight="bold">{node.val}</text>
                  <text x={node.x} y={node.y + 50} textAnchor="middle" fill="#4b5563"
                    fontSize="10" fontFamily="monospace">[{node.idx}]</text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Array Representation */}
        <div className="bg-dark-800/60 border border-dark-700 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-mono mr-2">Array:</span>
            {heap.map((val, idx) => {
              const isActive = activeIndices.includes(idx);
              const isSwap = swapping.includes(idx);
              let cls = 'border-dark-600 bg-dark-700 text-gray-300';
              if (isSwap) cls = 'border-neon-magenta bg-neon-magenta/20 text-neon-magenta';
              else if (isActive) cls = 'border-neon-cyan bg-neon-cyan/20 text-neon-cyan';
              return (
                <div key={idx} className={`w-10 h-10 flex flex-col items-center justify-center rounded border font-mono text-xs transition-all duration-300 ${cls}`}>
                  <span className="font-bold">{val}</span>
                  <span className="text-[8px] opacity-50">{idx}</span>
                </div>
              );
            })}
            {heap.length === 0 && <span className="text-gray-600 text-xs font-mono">empty</span>}
          </div>
        </div>
      </div>

      {/* Controls */}
      <ControlBar
        isPlaying={anim.isPlaying} isPaused={anim.isPaused} speed={anim.speed}
        stepCount={anim.stepCount}
        onStart={insertValue}
        onPause={anim.pause} onResume={anim.resume}
        onStop={anim.stop} onReset={() => { resetHighlights(); setHeap(heapType === 'min' ? [5, 10, 15, 20, 30, 25, 35] : [35, 25, 30, 20, 15, 10, 5]); }}
        onSpeedChange={anim.setSpeed}
        complexity={{ time: 'O(log n)', space: 'O(n)' }}
      />
    </div>
  );
}
