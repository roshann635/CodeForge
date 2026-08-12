import React, { useState, useEffect } from 'react';
import { ControlBar } from '../components/Visualizer/ControlBar';
import { StepInfo } from '../components/Visualizer/StepInfo';
import { PseudocodePanel } from '../components/Visualizer/PseudocodePanel';
import { ComplexityBadge } from '../components/Visualizer/ComplexityBadge';
import { ColorLegend } from '../components/Visualizer/ColorLegend';
import { BarChart } from '../components/Visualizer/BarChart';
import { ArrayCellRow } from '../components/Visualizer/ArrayCellRow';
import { LinkedListCanvas } from '../components/Visualizer/LinkedListCanvas';
import { StackQueueCanvas } from '../components/Visualizer/StackQueueCanvas';
import { HashTableCanvas } from '../components/Visualizer/HashTableCanvas';
import { TreeCanvas } from '../components/Visualizer/TreeCanvas';
import { GraphCanvas } from '../components/Visualizer/GraphCanvas';
import { useAlgorithm } from '../hooks/useAlgorithm';
import { sortingAlgorithms } from '../algorithms/sorting';
import { dataStructureAlgorithms } from '../algorithms/data-structures';
import { treeAlgorithms } from '../algorithms/trees';
import { graphAlgorithms } from '../algorithms/graphs';
import { ALGO_CATEGORIES, ALGO_TYPES } from '../utils/constants';

export const VisualizerPage = () => {
  const [activeCategory, setActiveCategory] = useState(ALGO_CATEGORIES.SORTING);
  const [activeAlgoId, setActiveAlgoId] = useState('bubble-sort');
  const [customInput, setCustomInput] = useState([38, 27, 43, 3, 9, 82, 10]);

  const allAlgorithms = { ...sortingAlgorithms, ...dataStructureAlgorithms, ...treeAlgorithms, ...graphAlgorithms };
  const activeAlgoSpecs = allAlgorithms[activeAlgoId] || sortingAlgorithms['bubble-sort'];
  
  const {
    steps,
    setSteps,
    stepIndex,
    currentStep,
    isPlaying,
    isFinished,
    isStarted,
    speed,
    setSpeed,
    stepForward,
    stepBack,
    reset,
    togglePlay,
    totalSteps
  } = useAlgorithm([]);

  const generateSteps = (input) => {
    if (activeAlgoSpecs && activeAlgoSpecs.generateSteps) {
      const newSteps = activeAlgoSpecs.generateSteps(input);
      setSteps(newSteps);
    }
  };

  // Re-generate steps when algorithm or input changes
  useEffect(() => {
    generateSteps(customInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAlgoId, customInput]);

  const handleCustomInput = (inputArray) => {
    setCustomInput(inputArray);
    reset(); // Pause and return to start
  };

  const handleAlgoChange = (id) => {
    setActiveAlgoId(id);
    reset();
  };

  return (
    <div className="visualizer-page animate-fade-in">
      
      {/* Category selector */}
      <div className="visualizer-category-bar">
        {Object.values(ALGO_CATEGORIES).map(cat => (
          <button 
            key={cat} 
            className={`category-chip ${cat === activeCategory ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Algorithm selector */}
      <div className="algo-selector">
        {ALGO_TYPES.filter(a => a.category === activeCategory).map(algo => (
          <button
            key={algo.id}
            className={`algo-chip ${algo.id === activeAlgoId ? 'active' : ''}`}
            onClick={() => handleAlgoChange(algo.id)}
          >
            {algo.name}
          </button>
        ))}
      </div>

      <div className="visualizer-main">
        <ControlBar 
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          stepForward={stepForward}
          stepBack={stepBack}
          reset={reset}
          isFinished={isFinished}
          isStarted={isStarted}
          speed={speed}
          setSpeed={setSpeed}
          onLoadCustomInput={handleCustomInput}
        />

        <div className="viz-area">
          {(!activeAlgoSpecs.componentId || activeAlgoSpecs.componentId === 'array') && (
            <>
              <BarChart 
                array={currentStep.array || []}
                comparing={currentStep.comparing || []}
                swapping={currentStep.swapping || []}
                sorted={currentStep.sorted || []}
                pivot={currentStep.pivot || -1}
                active={currentStep.active || -1}
              />
              <ArrayCellRow 
                array={currentStep.array || []}
                comparing={currentStep.comparing || []}
                swapping={currentStep.swapping || []}
                sorted={currentStep.sorted || []}
                pivot={currentStep.pivot || -1}
                active={currentStep.active || -1}
              />
            </>
          )}

          {activeAlgoSpecs.componentId === 'linked-list' && (
            <LinkedListCanvas 
              nodes={currentStep.nodes || []}
              headPointer={currentStep.headPointer}
              tailPointer={currentStep.tailPointer}
              activeNode={currentStep.activeNode}
              comparingNodes={currentStep.comparingNodes || []}
              foundNode={currentStep.foundNode}
            />
          )}

          {activeAlgoSpecs.componentId === 'stack-queue' && (
            <StackQueueCanvas 
              items={currentStep.items || []}
              type={currentStep.type || 'stack'}
              pushingNode={currentStep.pushingNode}
              poppingNode={currentStep.poppingNode}
            />
          )}

          {activeAlgoSpecs.componentId === 'hash-table' && (
            <HashTableCanvas 
              buckets={currentStep.buckets || []}
              hashFunction={currentStep.hashFunction}
              currentKey={currentStep.currentKey}
              currentHash={currentStep.currentHash}
              collisionResolution={currentStep.collisionResolution || []}
            />
          )}

          {activeAlgoSpecs.componentId === 'tree' && (
            <TreeCanvas 
              nodes={currentStep.nodes || []}
              edges={currentStep.edges || []}
              activeNode={currentStep.activeNode}
              comparingNodes={currentStep.comparingNodes || []}
              foundNode={currentStep.foundNode}
            />
          )}

          {activeAlgoSpecs.componentId === 'graph' && (
            <GraphCanvas 
              nodes={currentStep.nodes || []}
              edges={currentStep.edges || []}
              activeNode={currentStep.activeNode}
              comparingNodes={currentStep.comparingNodes || []}
              foundNode={currentStep.foundNode}
            />
          )}
        </div>

        <div className="panel-right">
          <PseudocodePanel 
            code={activeAlgoSpecs.code} 
            highlightLines={currentStep.highlightLines}
          />
          <ComplexityBadge complexities={activeAlgoSpecs.complexity} />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <StepInfo 
            stepIndex={stepIndex} 
            totalSteps={totalSteps} 
            description={currentStep.description} 
          />
          <ColorLegend />
        </div>
      </div>
    </div>
  );
};
