import React, { useState, useCallback } from 'react';
import ControlBar from './ControlBar';
import useAnimationControl from './useAnimationControl';

const TABLE_SIZE = 11;

function hashFn(val) {
  return val % TABLE_SIZE;
}

export default function HashTableVisualizer() {
  const [table, setTable] = useState(() => {
    const t = Array.from({ length: TABLE_SIZE }, () => []);
    [15, 7, 23, 34, 18, 29, 5].forEach(v => t[hashFn(v)].push(v));
    return t;
  });

  const [inputVal, setInputVal] = useState('');
  const [operation, setOperation] = useState('insert');
  const [activeSlot, setActiveSlot] = useState(-1);
  const [activeItem, setActiveItem] = useState(null);
  const [foundItem, setFoundItem] = useState(null);
  const [highlightedSlot, setHighlightedSlot] = useState(-1);
  const [hashResult, setHashResult] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const anim = useAnimationControl();

  const delay = useCallback(async (ms = 1) => {
    const result = await anim.sleep(ms);
    if (result === 'cancelled') throw new Error('cancelled');
  }, [anim]);

  const resetHighlights = () => {
    setActiveSlot(-1);
    setActiveItem(null);
    setFoundItem(null);
    setHighlightedSlot(-1);
    setHashResult('');
    setStatusMessage('');
  };

  const insertItem = useCallback(async () => {
    const val = parseInt(inputVal);
    if (isNaN(val)) { setStatusMessage('⚠ Enter a valid number'); return; }
    anim.start();
    resetHighlights();
    try {
      const slot = hashFn(val);
      setHashResult(`hash(${val}) = ${val} % ${TABLE_SIZE} = ${slot}`);
      setStatusMessage(`Computing hash for ${val}...`);
      await delay(anim.speed * 1.2);

      setActiveSlot(slot);
      setStatusMessage(`Slot ${slot} selected`);
      anim.incrementStep();
      await delay(anim.speed);

      if (table[slot].includes(val)) {
        setStatusMessage(`⚠ ${val} already exists in slot ${slot}`);
      } else {
        const collision = table[slot].length > 0;
        if (collision) {
          setStatusMessage(`⚡ Collision at slot ${slot}! Chaining...`);
          await delay(anim.speed);
        }
        setActiveItem(val);
        const newTable = table.map((chain, i) => i === slot ? [...chain, val] : [...chain]);
        setTable(newTable);
        setStatusMessage(`✅ Inserted ${val} at slot ${slot}${collision ? ' (chained)' : ''}`);
      }
      await delay(anim.speed);
      setActiveSlot(-1);
      setActiveItem(null);
    } catch (e) { if (e.message !== 'cancelled') console.error(e); }
    anim.finish();
  }, [inputVal, table, anim, delay]);

  const searchItem = useCallback(async () => {
    const val = parseInt(inputVal);
    if (isNaN(val)) { setStatusMessage('⚠ Enter a valid number'); return; }
    anim.start();
    resetHighlights();
    try {
      const slot = hashFn(val);
      setHashResult(`hash(${val}) = ${val} % ${TABLE_SIZE} = ${slot}`);
      setStatusMessage(`Computing hash for ${val}...`);
      await delay(anim.speed);

      setActiveSlot(slot);
      setStatusMessage(`Searching slot ${slot}...`);
      anim.incrementStep();
      await delay(anim.speed);

      for (let i = 0; i < table[slot].length; i++) {
        setActiveItem(table[slot][i]);
        setStatusMessage(`Checking chain[${i}]: ${table[slot][i]} === ${val}?`);
        anim.incrementStep();
        await delay(anim.speed);
        if (table[slot][i] === val) {
          setFoundItem(val);
          setStatusMessage(`✅ Found ${val} at slot ${slot}, position ${i}`);
          anim.finish();
          return;
        }
      }
      setStatusMessage(`❌ ${val} not found`);
      setActiveItem(null);
    } catch (e) { if (e.message !== 'cancelled') console.error(e); }
    anim.finish();
  }, [inputVal, table, anim, delay]);

  const deleteItem = useCallback(async () => {
    const val = parseInt(inputVal);
    if (isNaN(val)) { setStatusMessage('⚠ Enter a valid number'); return; }
    anim.start();
    resetHighlights();
    try {
      const slot = hashFn(val);
      setHashResult(`hash(${val}) = ${val} % ${TABLE_SIZE} = ${slot}`);
      setActiveSlot(slot);
      setStatusMessage(`Searching slot ${slot} for ${val}...`);
      anim.incrementStep();
      await delay(anim.speed);

      const idx = table[slot].indexOf(val);
      if (idx === -1) {
        setStatusMessage(`❌ ${val} not found`);
      } else {
        setActiveItem(val);
        setStatusMessage(`Found ${val}. Removing...`);
        await delay(anim.speed * 1.2);
        const newTable = table.map((chain, i) => i === slot ? chain.filter(v => v !== val) : [...chain]);
        setTable(newTable);
        setStatusMessage(`✅ Deleted ${val} from slot ${slot}`);
      }
      await delay(anim.speed);
      setActiveSlot(-1);
      setActiveItem(null);
    } catch (e) { if (e.message !== 'cancelled') console.error(e); }
    anim.finish();
  }, [inputVal, table, anim, delay]);

  const operations = {
    insert: { fn: insertItem, label: 'Insert' },
    search: { fn: searchItem, label: 'Search' },
    delete: { fn: deleteItem, label: 'Delete' },
  };

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
        <div className="ml-auto flex items-center gap-2">
          <input type="number" value={inputVal} onChange={(e) => setInputVal(e.target.value)}
            placeholder="Value" className="w-20 bg-dark-800 border border-dark-600 text-white px-2 py-1.5 rounded text-sm font-mono focus:border-neon-cyan outline-none" />
        </div>
      </div>

      {/* Description */}
      <div className="bg-dark-800/60 border border-dark-700 rounded-lg px-4 py-2 flex items-center justify-between">
        <p className="text-gray-400 text-sm">Hash Table with separate chaining. Hash function: <span className="text-neon-cyan font-mono">h(k) = k % {TABLE_SIZE}</span></p>
        {hashResult && <span className="text-neon-yellow text-xs font-mono">{hashResult}</span>}
      </div>

      {/* Hash Table Visualization */}
      <div className="flex-1 glass-panel p-6 flex flex-col gap-2 min-h-[350px] relative overflow-auto">
        <div className="absolute top-3 right-4 text-xs text-gray-400 font-mono">{statusMessage}</div>

        {table.map((chain, slotIdx) => {
          const isActive = activeSlot === slotIdx;
          return (
            <div key={slotIdx} className="flex items-center gap-2">
              {/* Slot index */}
              <div className={`w-12 h-10 flex items-center justify-center rounded-lg border-2 font-mono font-bold text-sm transition-all duration-300
                ${isActive ? 'border-neon-cyan bg-neon-cyan/20 text-neon-cyan shadow-[0_0_12px_#00f3ff33]' : 'border-dark-600 bg-dark-800 text-gray-400'}`}>
                [{slotIdx}]
              </div>

              {/* Arrow */}
              <div className={`w-6 h-0.5 ${isActive ? 'bg-neon-cyan' : 'bg-dark-600'} transition-colors`}></div>
              <div className={`w-0 h-0 border-l-[6px] ${isActive ? 'border-l-neon-cyan' : 'border-l-dark-600'} border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent`}></div>

              {/* Chain */}
              <div className="flex items-center gap-1">
                {chain.length === 0 ? (
                  <span className="text-gray-600 text-xs font-mono">empty</span>
                ) : (
                  chain.map((val, chainIdx) => {
                    const isActiveI = activeItem === val && isActive;
                    const isFoundI = foundItem === val;

                    let cls = 'border-dark-500 bg-dark-700 text-gray-200';
                    if (isFoundI) cls = 'border-neon-green bg-neon-green/20 text-neon-green shadow-[0_0_12px_#39ff1444]';
                    else if (isActiveI) cls = 'border-neon-yellow bg-neon-yellow/20 text-neon-yellow shadow-[0_0_12px_#fbff0044]';

                    return (
                      <React.Fragment key={chainIdx}>
                        <div className={`px-4 py-2 rounded-lg border font-mono font-bold text-sm transition-all duration-300 ${cls}`}>
                          {val}
                        </div>
                        {chainIdx < chain.length - 1 && (
                          <span className="text-dark-500 text-xs">→</span>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <ControlBar
        isPlaying={anim.isPlaying} isPaused={anim.isPaused} speed={anim.speed}
        stepCount={anim.stepCount}
        onStart={operations[operation].fn}
        onPause={anim.pause} onResume={anim.resume}
        onStop={anim.stop} onReset={resetHighlights}
        onSpeedChange={anim.setSpeed}
        complexity={{ time: 'O(1) avg', space: 'O(n)' }}
      />
    </div>
  );
}
