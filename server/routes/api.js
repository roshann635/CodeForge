const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/User");

const problems = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Array", "Hash Map"],
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
  },
  {
    id: 2,
    title: "Binary Search",
    difficulty: "Easy",
    tags: ["Array", "Binary Search"],
    description:
      "Given a sorted array and a target, return the index if found.",
  },
  {
    id: 3,
    title: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["Stack", "String"],
    description: "Determine if a string of brackets is valid.",
  },
  {
    id: 4,
    title: "Reverse Linked List",
    difficulty: "Medium",
    tags: ["Linked List"],
    description: "Reverse a singly linked list.",
  },
  {
    id: 5,
    title: "Maximum Subarray",
    difficulty: "Medium",
    tags: ["Array", "DP"],
    description: "Find the contiguous subarray with the largest sum.",
  },
  {
    id: 6,
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    tags: ["Linked List", "Recursion"],
    description: "Merge two sorted linked lists into one sorted list.",
  },
  {
    id: 7,
    title: "Climbing Stairs",
    difficulty: "Easy",
    tags: ["DP", "Math"],
    description: "Count distinct ways to climb n stairs taking 1 or 2 steps.",
  },
  {
    id: 8,
    title: "Number of Islands",
    difficulty: "Hard",
    tags: ["Graph", "BFS", "DFS"],
    description: "Count the number of islands in a 2D grid.",
  },
];

router.get("/problems", (req, res) => {
  res.json(problems);
});

const quizData = {
  arrays: [
    {
      id: 1,
      question: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
      answer: "O(log n)",
    },
    {
      id: 2,
      question: "Which data structure is used in BFS?",
      options: ["Stack", "Queue", "Tree", "Array"],
      answer: "Queue",
    },
    {
      id: 3,
      question: "What is the worst-case time complexity of QuickSort?",
      options: ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"],
      answer: "O(n^2)",
    },
    {
      id: 4,
      question: "What is the space complexity of Merge Sort?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
      answer: "O(n)",
    },
    {
      id: 5,
      question: "Two pointers technique works best on:",
      options: ["Unsorted arrays", "Sorted arrays", "Trees", "Graphs"],
      answer: "Sorted arrays",
    },
  ],
  trees: [
    {
      id: 1,
      question: "In-order traversal of BST gives:",
      options: ["Random order", "Descending", "Ascending", "Level order"],
      answer: "Ascending",
    },
    {
      id: 2,
      question: "Height of balanced BST with n nodes:",
      options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
      answer: "O(log n)",
    },
    {
      id: 3,
      question: "Pre-order visits:",
      options: [
        "Left-Root-Right",
        "Root-Left-Right",
        "Left-Right-Root",
        "Level order",
      ],
      answer: "Root-Left-Right",
    },
  ],
  graphs: [
    {
      id: 1,
      question: "BFS uses:",
      options: ["Stack", "Queue", "Heap", "Array"],
      answer: "Queue",
    },
    {
      id: 2,
      question: "DFS uses:",
      options: ["Queue", "Hash Map", "Stack", "Deque"],
      answer: "Stack",
    },
    {
      id: 3,
      question: "Time complexity of BFS/DFS:",
      options: ["O(V)", "O(E)", "O(V+E)", "O(VxE)"],
      answer: "O(V+E)",
    },
  ],
};

router.get("/quiz", (req, res) => {
  const topic = req.query.topic || "arrays";
  res.json(quizData[topic] || quizData.arrays);
});

// ============================================
// Personalized Tracking & Progress API
// ============================================

router.get("/progress", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      progress: user.progress || {
        problemsSolved: 0,
        accuracy: 100,
        quizScores: {},
        voiceScores: [],
        placementReadiness: 0,
        weakAreas: [],
        recentActivity: [],
      },
      gamification: user.gamification || {
        xp: 0,
        rankTier: 'Bronze',
        streak: { current: 0, highest: 0, lastActive: null },
        badges: []
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

router.post("/progress/update", protect, async (req, res) => {
  try {
    const { type, data } = req.body;
    const user = await User.findById(req.user._id);
    let prog = user.progress;
    let gamify = user.gamification;

    // --- Streak Logic ---
    const now = new Date();
    if (gamify.streak.lastActive) {
      const last = new Date(gamify.streak.lastActive);
      const diffTime = Math.abs(now - last);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
         gamify.streak.current += 1;
      } else if (diffDays > 1) {
         gamify.streak.current = 1;
      }
    } else {
      gamify.streak.current = 1;
    }
    gamify.streak.lastActive = now;
    if (gamify.streak.current > gamify.streak.highest) {
      gamify.streak.highest = gamify.streak.current;
    }
    // --------------------

    // Badge Evaluation Helper
    const awardBadge = (id, name, desc, iconColor) => {
      if (!gamify.badges.find(b => b.id === id)) {
        gamify.badges.push({ id, name, description: desc, iconColor });
        prog.recentActivity.unshift({
          type: "system", text: `Unlocked Badge: ${name} 🏆`, time: new Date()
        });
      }
    };

    if (now.getHours() >= 0 && now.getHours() < 4) {
      awardBadge('night_owl', 'Night Owl', 'Solved a challenge after midnight.', 'neon-purple');
    }

    if (type === "quiz") {
      gamify.xp += Math.floor(data.score * 0.2); // Up to 20 XP
      prog.quizScores.set(data.topic, data.score);
      prog.recentActivity.unshift({
        type: "quiz",
        text: `Completed ${data.topic} quiz (${data.score}%)`,
        time: now,
      });
      if (data.score < 60 && !prog.weakAreas.includes(data.topic)) {
        prog.weakAreas.push(data.topic);
      }
    } else if (type === "problem") {
      gamify.xp += 50; // Flat 50 XP for solving
      prog.problemsSolved += 1;
      prog.recentActivity.unshift({
        type: "problem",
        text: `Solved ${data.title} (+50 XP)`,
        time: now,
      });
      prog.placementReadiness = Math.min(100, prog.placementReadiness + 2);
      
      if (prog.problemsSolved === 1) {
        awardBadge('first_blood', 'First Blood', 'Solved your very first problem.', 'neon-cyan');
      }
      if (prog.problemsSolved >= 10) {
        awardBadge('coder_ten', 'Dedicated Hacker', 'Solved 10 problems.', 'neon-yellow');
      }

    } else if (type === "voice") {
      gamify.xp += 100; // 100 XP for explaining
      prog.voiceScores.push(data);
      prog.recentActivity.unshift({
        type: "voice",
        text: `Voice AI: ${data.topic} (${data.score}%) (+100 XP)`,
        time: now,
      });
      if (data.score < 60 && !prog.weakAreas.includes(data.topic)) {
        prog.weakAreas.push(data.topic);
      }
    }

    // Rank Tier Evaluation
    if (gamify.xp >= 1000) gamify.rankTier = 'CodeForge Elite';
    else if (gamify.xp >= 500) gamify.rankTier = 'Diamond';
    else if (gamify.xp >= 250) gamify.rankTier = 'Gold';
    else if (gamify.xp >= 100) gamify.rankTier = 'Silver';
    else gamify.rankTier = 'Bronze';

    prog.recentActivity = prog.recentActivity.slice(0, 10);
    user.progress = prog;
    user.gamification = gamify;
    await user.save();

    res.json({ success: true, progress: user.progress, gamification: user.gamification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update progress" });
  }
});

// ============================================
// Ecosystem & Gamification API
// ============================================

router.get("/leaderboard", async (req, res) => {
  try {
    const topUsers = await User.find({})
      .sort({ "gamification.xp": -1, "progress.problemsSolved": -1 })
      .limit(100)
      .select("name email gamification progress.problemsSolved")
      .lean();
    
    // Anonymize emails slightly for the leaderboard
    const formattedLeaderboard = topUsers.map((u, index) => ({
      rank: index + 1,
      id: u._id,
      identity: u.name || (u.email.split('@')[0].substring(0, 5) + '***'),
      xp: u.gamification?.xp || 0,
      tier: u.gamification?.rankTier || 'Bronze',
      problems: u.progress?.problemsSolved || 0,
      streak: u.gamification?.streak?.current || 0
    }));

    res.json(formattedLeaderboard);
  } catch (error) {
    console.error("Leaderboard Error: ", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

module.exports = router;
