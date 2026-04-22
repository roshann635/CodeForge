import React, { useState, useCallback } from 'react';
import ControlBar from './ControlBar';
import useAnimationControl from './useAnimationControl';
import { Plus, Trash2, Search } from 'lucide-react';

let nodeIdCounter = 0;
function createNode(val, next = null) {
  return { id: ++nodeIdCounter, val, next };
}

function listToArray(head) {
  const arr = [];
  let cur = head;
  while (cur) { arr.push(cur); cur = cur.next; }
  return arr;
}

function cloneList(head) {
  if (!head) return null;
  const map = new Map();
  let cur = head;
  while (cur) { map.set(cur, { ...cur }); cur = cur.next; }
  map.forEach((clone, orig) => { clone.next = orig.next ? map.get(orig.next) : null; });
  return map.get(head);
}

export default function LinkedListVisualizer() {
  const [head, setHead] = useState(() => {
    const n4 = createNode(40);
    const n3 = createNode(30, n4);
    const n2 = createNode(20, n3);
    const n1 = createNode(10, n2);
    return n1;
  });

  const [inputVal, setInputVal] = useState('');
  const [inputPos, setInputPos] = useState('');
  const [activeNodeId, setActiveNodeId] = useState(-1);
  const [foundNodeId, setFoundNodeId] = useState(-1);
  const [highlightedIds, setHighlightedIds] = useState([]);
  const [newNodeId, setNewNodeId] = useState(-1);
  const [deletingNodeId, setDeletingNodeId] = useState(-1);
  const [statusMessage, setStatusMessage] = useState('');
  const [operation, setOperation] = useState('traverse');

  const anim = useAnimationControl();

  const delay = useCallback(async (ms = 1) => {
    const result = await anim.sleep(ms);
    if (result === 'cancelled') throw new Error('cancelled');
  }, [anim]);

  const resetHighlights = () => {
    setActiveNodeId(-1);
    setFoundNodeId(-1);
    setHighlightedIds([]);
    setNewNodeId(-1);
    setDeletingNodeId(-1);
    setStatusMessage('');
  };

  const traverse = useCallback(async () => {
    anim.start();
    resetHighlights();
    try {
      let cur = head;
      let idx = 0;
      while (cur) {
        setActiveNodeId(cur.id);
        setHighlightedIds(prev => [...prev, cur.id]);
        setStatusMessage(`Visiting node ${idx}: value = ${cur.val}`);
        anim.incrementStep();
        await delay(anim.speed);
        cur = cur.next;
        idx++;
      }
      setStatusMessage(`✅ Traversal complete! ${idx} nodes visited.`);
      setActiveNodeId(-1);
    } catch (e) {
      if (e.message !== 'cancelled') console.error(e);
    }
    anim.finish();
  }, [head, anim, delay]);

  const insertAtHead = useCallback(async () => {
    const val = parseInt(inputVal);
    if (isNaN(val)) { setStatusMessage('⚠ Enter a valid number'); return; }
    anim.start();
    resetHighlights();
    try {
      setStatusMessage(`Creating new node with value ${val}`);
      const nn = createNode(val, head);
      setNewNodeId(nn.id);
      await delay(anim.speed * 1.5);
      setStatusMessage(`Linking new node → head`);
      await delay(anim.speed);
      setHead(nn);
      setStatusMessage(`✅ Inserted ${val} at head`);
      anim.incrementStep();
      await delay(anim.speed);
      setNewNodeId(-1);
    } catch (e) { if (e.message !== 'cancelled') console.error(e); }
    anim.finish();
  }, [head, inputVal, anim, delay]);

  const insertAtTail = useCallback(async () => {
    const val = parseInt(inputVal);
    if (isNaN(val)) { setStatusMessage('⚠ Enter a valid number'); return; }
    anim.start();
    resetHighlights();
    try {
      if (!head) {
        const nn = createNode(val);
        setNewNodeId(nn.id);
        setHead(nn);
        setStatusMessage(`✅ Inserted ${val} as first node`);
        anim.finish();
        return;
      }
      let newHead = cloneList(head);
      let cur = newHead;
      while (cur.next) {
        setActiveNodeId(cur.id);
        setHighlightedIds(prev => [...prev, cur.id]);
        setStatusMessage(`Traversing → node ${cur.val}`);
        anim.incrementStep();
        await delay(anim.speed);
        cur = cur.next;
      }
      setActiveNodeId(cur.id);
      setStatusMessage(`Found tail: ${cur.val}. Linking new node.`);
      await delay(anim.speed);
      const nn = createNode(val);
      cur.next = nn;
      setNewNodeId(nn.id);
      setHead(newHead);
      setStatusMessage(`✅ Inserted ${val} at tail`);
      anim.incrementStep();
      await delay(anim.speed);
      setActiveNodeId(-1);
      setNewNodeId(-1);
    } catch (e) { if (e.message !== 'cancelled') console.error(e); }
    anim.finish();
  }, [head, inputVal, anim, delay]);

  const deleteByValue = useCallback(async () => {
    const val = parseInt(inputVal);
    if (isNaN(val)) { setStatusMessage('⚠ Enter a value to delete'); return; }
    anim.start();
    resetHighlights();
    try {
      if (!head) { setStatusMessage('List is empty'); anim.finish(); return; }
      let newHead = cloneList(head);
      if (newHead.val === val) {
        setDeletingNodeId(newHead.id);
        setStatusMessage(`Found ${val} at head. Deleting...`);
        await delay(anim.speed * 1.5);
        setHead(newHead.next);
        setStatusMessage(`✅ Deleted ${val} from head`);
        anim.incrementStep();
        setDeletingNodeId(-1);
        anim.finish();
        return;
      }
      let cur = newHead;
      while (cur.next) {
        setActiveNodeId(cur.id);
        setHighlightedIds(prev => [...prev, cur.id]);
        setStatusMessage(`Checking ${cur.next.val}...`);
        anim.incrementStep();
        await delay(anim.speed);
        if (cur.next.val === val) {
          setDeletingNodeId(cur.next.id);
          setStatusMessage(`Found ${val}. Removing node...`);
          await delay(anim.speed * 1.5);
          cur.next = cur.next.next;
          setHead(newHead);
          setStatusMessage(`✅ Deleted ${val}`);
          setDeletingNodeId(-1);
          anim.finish();
          return;
        }
        cur = cur.next;
      }
      setStatusMessage(`❌ ${val} not found in the list`);
      setActiveNodeId(-1);
    } catch (e) { if (e.message !== 'cancelled') console.error(e); }
    anim.finish();
  }, [head, inputVal, anim, delay]);

  const searchValue = useCallback(async () => {
    const val = parseInt(inputVal);
    if (isNaN(val)) { setStatusMessage('⚠ Enter a value to search'); return; }
    anim.start();
    resetHighlights();
    try {
      let cur = head;
      let idx = 0;
      while (cur) {
        setActiveNodeId(cur.id);
        setHighlightedIds(prev => [...prev, cur.id]);
        setStatusMessage(`Checking index ${idx}: ${cur.val} === ${val}?`);
        anim.incrementStep();
        await delay(anim.speed);
        if (cur.val === val) {
          setFoundNodeId(cur.id);
          setActiveNodeId(-1);
          setStatusMessage(`✅ Found ${val} at index ${idx}!`);
          anim.finish();
          return;
        }
        cur = cur.next;
        idx++;
      }
      setStatusMessage(`❌ ${val} not found`);
      setActiveNodeId(-1);
    } catch (e) { if (e.message !== 'cancelled') console.error(e); }
    anim.finish();
  }, [head, inputVal, anim, delay]);

  const operations = {
    traverse: { fn: traverse, label: 'Traverse', needsInput: false },
    insertHead: { fn: insertAtHead, label: 'Insert at Head', needsInput: true },
    insertTail: { fn: insertAtTail, label: 'Insert at Tail', needsInput: true },
    delete: { fn: deleteByValue, label: 'Delete', needsInput: true },
    search: { fn: searchValue, label: 'Search', needsInput: true },
  };

  const runOperation = () => operations[operation].fn();
  const nodes = listToArray(head);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Operation Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {Object.entries(operations).map(([key, op]) => (
          <button key={key} onClick={() => { setOperation(key); resetHighlights(); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border
              ${operation === key ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50 shadow-[0_0_12px_#00f3ff33]'
                : 'bg-dark-800 text-gray-400 border-dark-600 hover:text-white hover:border-dark-500'}`}>
            {op.label}
          </button>
        ))}

        {operations[operation].needsInput && (
          <div className="ml-auto flex items-center gap-2">
            <input type="number" value={inputVal} onChange={(e) => setInputVal(e.target.value)}
              placeholder="Value" className="w-20 bg-dark-800 border border-dark-600 text-white px-2 py-1.5 rounded text-sm font-mono focus:border-neon-cyan outline-none" />
          </div>
        )}
      </div>

      {/* Description */}
      <div className="bg-dark-800/60 border border-dark-700 rounded-lg px-4 py-2 flex items-center justify-between">
        <p className="text-gray-400 text-sm">Singly Linked List — each node stores a value and a pointer to the next node.</p>
        <div className="flex gap-4 text-xs">
          <span className="text-gray-500">Access: <span className="text-neon-yellow font-mono">O(n)</span></span>
          <span className="text-gray-500">Insert (Head): <span className="text-neon-green font-mono">O(1)</span></span>
          <span className="text-gray-500">Search: <span className="text-neon-yellow font-mono">O(n)</span></span>
        </div>
      </div>

      {/* Linked List Visualization */}
      <div className="flex-1 glass-panel p-8 flex items-center justify-start overflow-x-auto min-h-[350px] relative">
        <div className="absolute top-3 left-4 text-xs text-gray-400 font-mono">{statusMessage}</div>

        <div className="flex items-center gap-0 mx-auto">
          {/* HEAD pointer */}
          <div className="flex flex-col items-center mr-3">
            <span className="text-neon-purple text-xs font-mono font-bold mb-1">HEAD</span>
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-neon-purple"></div>
          </div>

          {nodes.map((node, idx) => {
            const isActive = activeNodeId === node.id;
            const isFound = foundNodeId === node.id;
            const isNew = newNodeId === node.id;
            const isDeleting = deletingNodeId === node.id;
            const isVisited = highlightedIds.includes(node.id);

            let borderClass = 'border-dark-500';
            let bgClass = 'bg-dark-700';
            let textClass = 'text-gray-200';
            let shadow = '';

            if (isFound) { borderClass = 'border-neon-green'; bgClass = 'bg-neon-green/20'; textClass = 'text-neon-green'; shadow = 'shadow-[0_0_20px_#39ff1455]'; }
            else if (isDeleting) { borderClass = 'border-red-500'; bgClass = 'bg-red-500/20'; textClass = 'text-red-400'; shadow = 'shadow-[0_0_15px_#ef444455] animate-pulse'; }
            else if (isNew) { borderClass = 'border-neon-yellow'; bgClass = 'bg-neon-yellow/20'; textClass = 'text-neon-yellow'; shadow = 'shadow-[0_0_15px_#fbff0044] animate-bounce'; }
            else if (isActive) { borderClass = 'border-neon-cyan'; bgClass = 'bg-neon-cyan/20'; textClass = 'text-neon-cyan'; shadow = 'shadow-[0_0_15px_#00f3ff44]'; }
            else if (isVisited) { borderClass = 'border-neon-purple/50'; bgClass = 'bg-neon-purple/10'; textClass = 'text-neon-purple'; }

            return (
              <React.Fragment key={node.id}>
                <div className={`flex rounded-xl border-2 ${borderClass} ${bgClass} ${shadow} transition-all duration-300 overflow-hidden`}>
                  {/* Value */}
                  <div className={`px-5 py-4 flex flex-col items-center justify-center min-w-[60px] ${textClass}`}>
                    <span className="font-mono font-bold text-lg">{node.val}</span>
                    <span className="text-[9px] opacity-50 mt-0.5">idx:{idx}</span>
                  </div>
                  {/* Next pointer section */}
                  <div className={`px-3 py-4 flex items-center justify-center border-l ${borderClass} bg-dark-900/30`}>
                    <span className="text-[10px] text-gray-500 font-mono">{node.next ? '→' : 'null'}</span>
                  </div>
                </div>
                {/* Arrow */}
                {node.next && (
                  <div className="flex items-center">
                    <div className={`w-8 h-0.5 ${isVisited || isActive ? 'bg-neon-cyan' : 'bg-dark-500'} transition-colors`}></div>
                    <div className={`w-0 h-0 border-l-[8px] ${isVisited || isActive ? 'border-l-neon-cyan' : 'border-l-dark-500'} border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent transition-colors`}></div>
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* NULL terminator */}
          <div className="ml-2 flex items-center">
            <div className="w-4 h-0.5 bg-dark-500"></div>
            <div className="px-3 py-2 border border-dark-600 rounded-lg bg-dark-900 text-gray-600 text-xs font-mono">NULL</div>
          </div>
        </div>

        {nodes.length === 0 && (
          <div className="flex items-center justify-center w-full text-gray-500 text-sm">
            Empty list — insert a node to begin
          </div>
        )}
      </div>

      {/* Controls */}
      <ControlBar
        isPlaying={anim.isPlaying} isPaused={anim.isPaused} speed={anim.speed}
        stepCount={anim.stepCount}
        onStart={runOperation} onPause={anim.pause} onResume={anim.resume}
        onStop={anim.stop} onReset={() => resetHighlights()}
        onSpeedChange={anim.setSpeed}
        complexity={{ time: 'O(n)', space: 'O(1)' }}
      />
    </div>
  );
}
