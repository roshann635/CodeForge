import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Trophy,
  RotateCcw,
} from "lucide-react";

const QUIZ_DATA = {
  arrays: [
    {
      id: 1,
      question:
        "What is the time complexity of accessing an element in an array by index?",
      options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
      answer: "O(1)",
    },
    {
      id: 2,
      question: "What is the worst-case time complexity of linear search?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
      answer: "O(n)",
    },
    {
      id: 3,
      question:
        "Which sorting algorithm has the best average-case time complexity?",
      options: [
        "Bubble Sort",
        "Merge Sort",
        "Selection Sort",
        "Insertion Sort",
      ],
      answer: "Merge Sort",
    },
    {
      id: 4,
      question: "What is the space complexity of Merge Sort?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
      answer: "O(n)",
    },
    {
      id: 5,
      question: "Two pointers technique is most useful for:",
      options: [
        "Unsorted arrays",
        "Sorted arrays",
        "Linked lists only",
        "Trees only",
      ],
      answer: "Sorted arrays",
    },
  ],
  trees: [
    {
      id: 1,
      question:
        "What is the maximum number of nodes at level L of a binary tree?",
      options: ["2L", "2^L", "L²", "L+1"],
      answer: "2^L",
    },
    {
      id: 2,
      question: "In-order traversal of a BST gives elements in:",
      options: [
        "Random order",
        "Descending order",
        "Ascending order",
        "Level order",
      ],
      answer: "Ascending order",
    },
    {
      id: 3,
      question: "The height of a balanced BST with n nodes is:",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      answer: "O(log n)",
    },
    {
      id: 4,
      question: "Which traversal visits root → left → right?",
      options: ["In-order", "Pre-order", "Post-order", "Level-order"],
      answer: "Pre-order",
    },
    {
      id: 5,
      question: "A complete binary tree with n nodes has height:",
      options: ["n", "log₂(n)", "n/2", "√n"],
      answer: "log₂(n)",
    },
  ],
  graphs: [
    {
      id: 1,
      question: "Which data structure is used in BFS?",
      options: ["Stack", "Queue", "Heap", "Array"],
      answer: "Queue",
    },
    {
      id: 2,
      question: "Which data structure is used in DFS?",
      options: ["Queue", "Hash Map", "Stack", "Deque"],
      answer: "Stack",
    },
    {
      id: 3,
      question: "Time complexity of BFS/DFS is:",
      options: ["O(V)", "O(E)", "O(V+E)", "O(V×E)"],
      answer: "O(V+E)",
    },
    {
      id: 4,
      question: "Dijkstra's algorithm finds:",
      options: [
        "Minimum Spanning Tree",
        "Shortest Path",
        "Maximum Flow",
        "Topological Order",
      ],
      answer: "Shortest Path",
    },
    {
      id: 5,
      question: "Which algorithm detects negative weight cycles?",
      options: ["Dijkstra's", "Prim's", "Bellman-Ford", "Kruskal's"],
      answer: "Bellman-Ford",
    },
  ],
  dp: [
    {
      id: 1,
      question: "Dynamic Programming is applicable when a problem has:",
      options: [
        "Greedy property",
        "Overlapping subproblems",
        "No recursion",
        "Linear structure",
      ],
      answer: "Overlapping subproblems",
    },
    {
      id: 2,
      question: "Memoization is a technique of:",
      options: [
        "Bottom-up DP",
        "Top-down DP",
        "Greedy approach",
        "Divide and conquer",
      ],
      answer: "Top-down DP",
    },
    {
      id: 3,
      question: "Time complexity of the 0/1 Knapsack problem (DP) is:",
      options: ["O(n)", "O(nW)", "O(2^n)", "O(n²)"],
      answer: "O(nW)",
    },
    {
      id: 4,
      question: "Which is NOT a classic DP problem?",
      options: [
        "Fibonacci",
        "Longest Common Subsequence",
        "Binary Search",
        "Edit Distance",
      ],
      answer: "Binary Search",
    },
    {
      id: 5,
      question: "Tabulation refers to:",
      options: [
        "Top-down approach",
        "Bottom-up approach",
        "Caching results",
        "Recursive calls",
      ],
      answer: "Bottom-up approach",
    },
  ],
  hashing: [
    {
      id: 1,
      question: "Average time complexity of hash table lookup:",
      options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
      answer: "O(1)",
    },
    {
      id: 2,
      question: "Collision in hash tables occurs when:",
      options: [
        "Table is empty",
        "Two keys map to the same index",
        "Key is not found",
        "Table is full",
      ],
      answer: "Two keys map to the same index",
    },
    {
      id: 3,
      question: "Separate chaining uses which data structure at each bucket?",
      options: ["Array", "Linked List", "Stack", "Heap"],
      answer: "Linked List",
    },
    {
      id: 4,
      question: "Load factor of a hash table is:",
      options: ["n × m", "n / m", "m / n", "n + m"],
      answer: "n / m",
    },
    {
      id: 5,
      question: "Open addressing resolves collisions by:",
      options: [
        "Using linked lists",
        "Probing for next empty slot",
        "Resizing the table",
        "Ignoring the collision",
      ],
      answer: "Probing for next empty slot",
    },
  ],
  sorting: [
    {
      id: 1,
      question: "What is the worst-case time complexity of QuickSort?",
      options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
      answer: "O(n²)",
    },
    {
      id: 2,
      question: "Which sorting algorithm is NOT comparison-based?",
      options: ["Merge Sort", "Quick Sort", "Counting Sort", "Heap Sort"],
      answer: "Counting Sort",
    },
    {
      id: 3,
      question: "Which sort is stable?",
      options: ["Quick Sort", "Heap Sort", "Merge Sort", "Selection Sort"],
      answer: "Merge Sort",
    },
    {
      id: 4,
      question: "Best case of Bubble Sort with early termination:",
      options: ["O(n²)", "O(n log n)", "O(n)", "O(1)"],
      answer: "O(n)",
    },
    {
      id: 5,
      question: "Heap Sort uses which data structure?",
      options: ["Stack", "Queue", "Binary Heap", "Hash Table"],
      answer: "Binary Heap",
    },
  ],
};

export default function Quiz() {
  const { topic } = useParams();
  const navigate = useNavigate();
  const topicKey = topic || "arrays";
  const questions = QUIZ_DATA[topicKey] || QUIZ_DATA.arrays;

  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    if (showResult || isAnswered) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentQ, showResult, isAnswered]);

  const handleTimeout = () => {
    if (!isAnswered) {
      setAnswers((prev) => [
        ...prev,
        {
          question: currentQ,
          selected: null,
          correct: questions[currentQ].answer,
          isCorrect: false,
        },
      ]);
      setIsAnswered(true);
      setTimeout(() => nextQuestion(), 1500);
    }
  };

  const handleAnswer = (option) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);
    const isCorrect = option === questions[currentQ].answer;
    setAnswers((prev) => [
      ...prev,
      {
        question: currentQ,
        selected: option,
        correct: questions[currentQ].answer,
        isCorrect,
      },
    ]);
    setTimeout(() => nextQuestion(), 1500);
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      setShowResult(true);
    } else {
      setCurrentQ((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(30);
    }
  };

  const restart = () => {
    setCurrentQ(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowResult(false);
    setTimeLeft(30);
    setIsAnswered(false);
  };

  const score = answers.filter((a) => a.isCorrect).length;
  const percentage = Math.round((score / questions.length) * 100);

  // Send progress update
  useEffect(() => {
    if (showResult && percentage >= 0) {
      fetch("http://localhost:5000/api/progress/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "quiz",
          data: { topic: topicKey, score: percentage },
        }),
      }).catch((err) => console.log("Progress update failed"));
    }
  }, [showResult, percentage, topicKey]);

  if (showResult) {
    return (
      <div className="max-w-2xl mx-auto text-white space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <Trophy
            className={`mx-auto ${percentage >= 80 ? "text-neon-yellow" : percentage >= 50 ? "text-neon-cyan" : "text-gray-400"}`}
            size={64}
          />
          <h2 className="text-4xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">
            Quiz Complete!
          </h2>
          <div className="text-6xl font-bold font-orbitron">
            <span
              className={
                percentage >= 80
                  ? "text-neon-green"
                  : percentage >= 50
                    ? "text-neon-yellow"
                    : "text-red-400"
              }
            >
              {percentage}%
            </span>
          </div>
          <p className="text-gray-400">
            {score}/{questions.length} correct answers
          </p>
        </div>

        <div className="glass-panel p-6 space-y-3">
          {answers.map((ans, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-lg border ${ans.isCorrect ? "border-neon-green/30 bg-neon-green/5" : "border-red-500/30 bg-red-500/5"}`}
            >
              {ans.isCorrect ? (
                <CheckCircle
                  size={18}
                  className="text-neon-green flex-shrink-0"
                />
              ) : (
                <XCircle size={18} className="text-red-400 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300 truncate">
                  Q{idx + 1}: {questions[idx].question}
                </p>
                {!ans.isCorrect && (
                  <p className="text-xs text-neon-green mt-0.5">
                    Correct: {ans.correct}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={restart}
            className="flex items-center gap-2 px-6 py-3 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 rounded-xl font-medium hover:bg-neon-cyan/30 transition-all"
          >
            <RotateCcw size={18} /> Retry
          </button>
          <Link
            to="/learn"
            className="flex items-center gap-2 px-6 py-3 bg-dark-700 text-gray-300 border border-dark-600 rounded-xl font-medium hover:bg-dark-600 transition-all"
          >
            Back to Learn <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="max-w-2xl mx-auto text-white space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">
          Quiz: {topicKey.charAt(0).toUpperCase() + topicKey.slice(1)}
        </h2>
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 text-sm font-mono ${timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-gray-400"}`}
          >
            <Clock size={16} /> {timeLeft}s
          </div>
          <span className="text-sm text-gray-500">
            {currentQ + 1}/{questions.length}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full bg-dark-800 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-neon-purple to-neon-magenta h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${(currentQ / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="glass-panel p-8 space-y-6">
        <h3 className="text-xl font-medium text-gray-100 leading-relaxed">
          {q.question}
        </h3>

        <div className="grid gap-3">
          {q.options.map((option, idx) => {
            let btnClass =
              "bg-dark-700/80 border-dark-500 text-gray-300 hover:bg-dark-600 hover:border-neon-cyan/30";
            if (isAnswered) {
              if (option === q.answer) {
                btnClass =
                  "bg-neon-green/20 border-neon-green text-neon-green shadow-[0_0_15px_#39ff1433]";
              } else if (option === selectedAnswer && option !== q.answer) {
                btnClass =
                  "bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_#ef444433]";
              } else {
                btnClass = "bg-dark-800 border-dark-600 text-gray-600";
              }
            }
            return (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                disabled={isAnswered}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-300 font-medium ${btnClass} disabled:cursor-default`}
              >
                <span className="text-xs text-gray-500 mr-3 font-mono">
                  {String.fromCharCode(65 + idx)}.
                </span>
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
