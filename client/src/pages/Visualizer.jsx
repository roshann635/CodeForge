import React, { useState } from 'react';
import { BarChart3, Search, Link2, TreePine, GitFork, Layers, Hash, Triangle } from 'lucide-react';
import SortingVisualizer from './visualizers/SortingVisualizer';
import SearchingVisualizer from './visualizers/SearchingVisualizer';
import LinkedListVisualizer from './visualizers/LinkedListVisualizer';
import BSTVisualizer from './visualizers/BSTVisualizer';
import GraphVisualizer from './visualizers/GraphVisualizer';
import StackQueueVisualizer from './visualizers/StackQueueVisualizer';
import HashTableVisualizer from './visualizers/HashTableVisualizer';
import HeapVisualizer from './visualizers/HeapVisualizer';

const CATEGORIES = [
  { key: 'sorting', label: 'Sorting', icon: BarChart3, color: 'neon-cyan', desc: 'Bubble, Selection, Insertion, Merge, Quick Sort' },
  { key: 'searching', label: 'Searching', icon: Search, color: 'neon-green', desc: 'Linear Search, Binary Search' },
  { key: 'linkedlist', label: 'Linked List', icon: Link2, color: 'neon-magenta', desc: 'Insert, Delete, Search, Traverse' },
  { key: 'bst', label: 'Binary Search Tree', icon: TreePine, color: 'neon-purple', desc: 'Insert, Search, Traversals' },
  { key: 'graph', label: 'Graph Traversal', icon: GitFork, color: 'neon-yellow', desc: 'BFS, DFS' },
  { key: 'stackqueue', label: 'Stack & Queue', icon: Layers, color: 'neon-cyan', desc: 'Push, Pop, Enqueue, Dequeue' },
  { key: 'hashtable', label: 'Hash Table', icon: Hash, color: 'neon-green', desc: 'Insert, Search, Delete, Chaining' },
  { key: 'heap', label: 'Binary Heap', icon: Triangle, color: 'neon-magenta', desc: 'Min-Heap, Max-Heap, Insert, Extract' },
];

const colorMap = {
  'neon-cyan': { bg: 'bg-neon-cyan/10', border: 'border-neon-cyan/50', text: 'text-neon-cyan', shadow: 'shadow-[0_0_15px_#00f3ff22]', hover: 'hover:bg-neon-cyan/20' },
  'neon-green': { bg: 'bg-neon-green/10', border: 'border-neon-green/50', text: 'text-neon-green', shadow: 'shadow-[0_0_15px_#39ff1422]', hover: 'hover:bg-neon-green/20' },
  'neon-magenta': { bg: 'bg-neon-magenta/10', border: 'border-neon-magenta/50', text: 'text-neon-magenta', shadow: 'shadow-[0_0_15px_#ff00ea22]', hover: 'hover:bg-neon-magenta/20' },
  'neon-purple': { bg: 'bg-neon-purple/10', border: 'border-neon-purple/50', text: 'text-neon-purple', shadow: 'shadow-[0_0_15px_#b026ff22]', hover: 'hover:bg-neon-purple/20' },
  'neon-yellow': { bg: 'bg-neon-yellow/10', border: 'border-neon-yellow/50', text: 'text-neon-yellow', shadow: 'shadow-[0_0_15px_#fbff0022]', hover: 'hover:bg-neon-yellow/20' },
};

const VISUALIZER_COMPONENTS = {
  sorting: SortingVisualizer,
  searching: SearchingVisualizer,
  linkedlist: LinkedListVisualizer,
  bst: BSTVisualizer,
  graph: GraphVisualizer,
  stackqueue: StackQueueVisualizer,
  hashtable: HashTableVisualizer,
  heap: HeapVisualizer,
};

export default function Visualizer() {
  const [activeCategory, setActiveCategory] = useState('sorting');
  const ActiveComponent = VISUALIZER_COMPONENTS[activeCategory];
  const activeCat = CATEGORIES.find(c => c.key === activeCategory);

  return (
    <div className="flex gap-4 h-[calc(100vh-4rem)] text-white">
      {/* Category Sidebar */}
      <div className="w-56 flex-shrink-0 flex flex-col gap-1.5 overflow-y-auto pr-1 py-1">
        <h2 className="text-lg font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple mb-3 px-2">
          Visualizer
        </h2>

        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const colors = colorMap[cat.color];
          const isActive = activeCategory === cat.key;

          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all duration-200 group
                ${isActive
                  ? `${colors.bg} ${colors.border} ${colors.shadow}`
                  : `bg-transparent border-transparent hover:bg-dark-700/50 hover:border-dark-600`}`}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={16} className={`${isActive ? colors.text : 'text-gray-500 group-hover:text-gray-300'} transition-colors flex-shrink-0`} />
                <div className="min-w-0">
                  <p className={`text-sm font-medium truncate ${isActive ? colors.text : 'text-gray-300 group-hover:text-white'} transition-colors`}>
                    {cat.label}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate leading-tight mt-0.5">{cat.desc}</p>
                </div>
              </div>
            </button>
          );
        })}

        {/* Info box at bottom */}
        <div className="mt-auto pt-4 px-2">
          <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-3 text-[10px] text-gray-500 leading-relaxed">
            <p className="text-gray-400 font-medium mb-1">💡 Tips</p>
            <p>• Use speed slider to control animation</p>
            <p>• Click Run to start visualization</p>
            <p>• Pause anytime to inspect state</p>
          </div>
        </div>
      </div>

      {/* Main Visualization Area */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <ActiveComponent />
      </div>
    </div>
  );
}
