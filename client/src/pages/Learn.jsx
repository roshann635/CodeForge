import React, { useState } from "react";
import {
  Play,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Code,
  Clock,
  Zap,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";

const MODULES = [
  {
    title: "Arrays & Sorting",
    desc: "Master array operations, Bubble Sort, Merge Sort, and Two Pointers.",
    progress: 100,
    quizTopic: "sorting",
    difficulty: "Beginner",
    estimatedTime: "2 hours",
    subtopics: [
      {
        name: "Array Basics",
        content:
          "Arrays are contiguous blocks of memory that store elements of the same type. Access is O(1) by index, insertion/deletion is O(n) due to shifting.",
      },
      {
        name: "Bubble Sort",
        content:
          "Compare adjacent elements and swap if out of order. Repeat until sorted. Time: O(n²), Space: O(1). Stable sort.",
      },
      {
        name: "Selection Sort",
        content:
          "Find the minimum element in the unsorted portion and place it at the beginning. Time: O(n²), Space: O(1). Not stable.",
      },
      {
        name: "Merge Sort",
        content:
          "Divide array in half, recursively sort each half, then merge. Time: O(n log n), Space: O(n). Stable sort, uses divide & conquer.",
      },
      {
        name: "Quick Sort",
        content:
          "Pick a pivot, partition elements around it, recursively sort partitions. Average: O(n log n), Worst: O(n²), Space: O(log n).",
      },
      {
        name: "Two Pointers",
        content:
          "Use two pointers moving towards each other or in the same direction on a sorted array. Useful for pair sum, removing duplicates, etc.",
      },
    ],
  },
  {
    title: "Trees & BST",
    desc: "Traverse binary trees with BFS, DFS, and master BST operations.",
    progress: 40,
    quizTopic: "trees",
    difficulty: "Intermediate",
    estimatedTime: "3 hours",
    subtopics: [
      {
        name: "Binary Tree Basics",
        content:
          "A tree where each node has at most two children (left and right). Used for hierarchical data representation.",
      },
      {
        name: "Tree Traversals",
        content:
          "In-order (Left→Root→Right), Pre-order (Root→Left→Right), Post-order (Left→Right→Root), Level-order (BFS).",
      },
      {
        name: "Binary Search Tree",
        content:
          "BST property: left subtree < root < right subtree. Enables O(log n) search, insert, delete on average.",
      },
      {
        name: "BST Operations",
        content:
          "Search: compare with root, go left/right. Insert: find correct null position. Delete: handle 0, 1, or 2 children cases.",
      },
    ],
  },
  {
    title: "Graphs",
    desc: "Learn graph representations, BFS, DFS, and shortest paths.",
    progress: 20,
    quizTopic: "graphs",
    difficulty: "Intermediate",
    estimatedTime: "4 hours",
    subtopics: [
      {
        name: "Graph Representation",
        content:
          "Adjacency Matrix (O(V²) space, O(1) lookup) vs Adjacency List (O(V+E) space, efficient for sparse graphs).",
      },
      {
        name: "BFS (Breadth-First Search)",
        content:
          "Uses a queue, explores level by level. Time: O(V+E). Used for shortest path in unweighted graphs.",
      },
      {
        name: "DFS (Depth-First Search)",
        content:
          "Uses a stack/recursion, explores as deep as possible. Time: O(V+E). Used for cycle detection, topological sort.",
      },
      {
        name: "Shortest Paths",
        content:
          "Dijkstra (non-negative weights, O((V+E)logV)), Bellman-Ford (handles negative weights, O(VE)).",
      },
    ],
  },
  {
    title: "Dynamic Programming",
    desc: "Optimize recursive approaches with memoization and tabulation.",
    progress: 0,
    quizTopic: "dp",
    difficulty: "Advanced",
    estimatedTime: "5 hours",
    subtopics: [
      {
        name: "DP Fundamentals",
        content:
          "DP applies when a problem has optimal substructure and overlapping subproblems. Two approaches: top-down (memoization) and bottom-up (tabulation).",
      },
      {
        name: "Classic Problems",
        content:
          "Fibonacci, Climbing Stairs, Coin Change, Longest Common Subsequence, 0/1 Knapsack, Edit Distance.",
      },
      {
        name: "Memoization",
        content:
          "Top-down approach: solve recursively but cache results of subproblems. Often easier to implement from recursive solution.",
      },
      {
        name: "Tabulation",
        content:
          "Bottom-up approach: build solution iteratively from smallest subproblems. Often more space-efficient.",
      },
    ],
  },
  {
    title: "Hashing",
    desc: "Understand hash tables, collision resolution, and applications.",
    progress: 0,
    quizTopic: "hashing",
    difficulty: "Intermediate",
    estimatedTime: "2 hours",
    subtopics: [
      {
        name: "Hash Functions",
        content:
          "Maps keys to array indices. Good hash functions distribute keys uniformly. Common: division method (k mod m).",
      },
      {
        name: "Collision Resolution",
        content:
          "Separate Chaining (linked list per bucket) vs Open Addressing (linear probing, quadratic probing, double hashing).",
      },
      {
        name: "Applications",
        content:
          "Two Sum problem, frequency counting, caching (LRU), duplicate detection, string matching (Rabin-Karp).",
      },
    ],
  },
  {
    title: "Stacks & Queues",
    desc: "Master LIFO/FIFO structures and their applications.",
    progress: 0,
    quizTopic: "arrays",
    difficulty: "Beginner",
    estimatedTime: "1.5 hours",
    subtopics: [
      {
        name: "Stack (LIFO)",
        content:
          "Last In First Out. Operations: push, pop, peek — all O(1). Used in: undo operations, balanced parentheses, function call stack.",
      },
      {
        name: "Queue (FIFO)",
        content:
          "First In First Out. Operations: enqueue, dequeue, front — all O(1). Used in: BFS, task scheduling, buffering.",
      },
      {
        name: "Applications",
        content:
          "Stack: expression evaluation, backtracking. Queue: level-order traversal, producer-consumer. Deque: sliding window maximum.",
      },
    ],
  },
];

const difficultyColors = {
  Beginner: "text-neon-green bg-neon-green/10 border-neon-green/30",
  Intermediate: "text-neon-yellow bg-neon-yellow/10 border-neon-yellow/30",
  Advanced: "text-neon-magenta bg-neon-magenta/10 border-neon-magenta/30",
};

export default function Learn() {
  const [expandedIdx, setExpandedIdx] = useState(-1);

  return (
    <div className="space-y-6 text-white max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-magenta text-glow-purple">
          Learning Paths
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <BookOpen size={16} />
          <span>{MODULES.length} modules</span>
        </div>
      </div>

      <div className="grid gap-4">
        {MODULES.map((mod, idx) => {
          const isExpanded = expandedIdx === idx;
          return (
            <div
              key={idx}
              className={`glass-panel border transition-all duration-300 overflow-hidden
              ${isExpanded ? "border-neon-purple/50 shadow-[0_0_20px_#b026ff22]" : "border-dark-600 hover:border-dark-500"}`}
            >
              {/* Header */}
              <div
                className="p-5 cursor-pointer"
                onClick={() => setExpandedIdx(isExpanded ? -1 : idx)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronDown size={20} className="text-neon-purple" />
                      ) : (
                        <ChevronRight size={20} className="text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="text-lg font-bold text-neon-cyan">
                          {mod.title}
                        </h3>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${difficultyColors[mod.difficulty]}`}
                        >
                          {mod.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{mod.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock size={12} />
                      <span>{mod.estimatedTime}</span>
                    </div>
                    <div className="w-24">
                      <div className="w-full bg-dark-900 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-neon-purple to-neon-magenta h-1.5 rounded-full transition-all"
                          style={{ width: `${mod.progress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-500 text-right mt-1">
                        {mod.progress}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-dark-700 px-5 py-4 space-y-3 animate-fade-in">
                  {mod.subtopics.map((sub, subIdx) => (
                    <div
                      key={subIdx}
                      className="bg-dark-900/50 border border-dark-700 rounded-xl p-4 hover:border-dark-600 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Code size={14} className="text-neon-cyan" />
                        <h4 className="font-medium text-gray-200">
                          {sub.name}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed pl-5">
                        {sub.content}
                      </p>
                    </div>
                  ))}

                  <div className="flex justify-between pt-2">
                    <Link
                      to={`/quiz/${mod.quizTopic}`}
                      className="flex items-center gap-2 px-5 py-2.5 bg-neon-purple/20 hover:bg-neon-purple/30 text-neon-purple border border-neon-purple/50 rounded-xl font-medium text-sm transition-all hover:shadow-[0_0_15px_#b026ff33]"
                    >
                      <Zap size={16} /> Take Quiz
                    </Link>
                    <Link
                      to="/visualize"
                      className="flex items-center gap-2 px-5 py-2.5 bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border border-neon-cyan/50 rounded-xl font-medium text-sm transition-all hover:shadow-[0_0_15px_#00f3ff33]"
                    >
                      <BarChart3 size={16} /> Visualize
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
