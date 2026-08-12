const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Problem = require("../models/Problem");
const TestCase = require("../models/TestCase");

// Raw problems data
const rawProblems = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Array", "Hash Map"],
    funcName: "twoSum",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
    examples: [
      { input: "[2,7,11,15], 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." }
    ],
    starterCode: {
      javascript: "function twoSum(nums, target) {\n  // Write your solution here\n  return null;\n}",
      python: "def two_sum(nums, target):\n    # Write your solution here\n    pass",
      java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[]{};\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        return {};\n    }\n};"
    },
    testCases: [
      { input: "[2,7,11,15], 9", expected: "[0,1]", type: "PUBLIC" },
      { input: "[3,2,4], 6", expected: "[1,2]", type: "PUBLIC" },
      { input: "[3,3], 6", expected: "[0,1]", type: "HIDDEN" },
      { input: "[-1,-2,-3,-4,-5], -8", expected: "[2,4]", type: "EDGE" }
    ],
    referenceSolution: {
      javascript: "function twoSum(nums, target) {\n  const map = {};\n  for (let i = 0; i < nums.length; i++) {\n    if (map[target - nums[i]] !== undefined) return [map[target - nums[i]], i];\n    map[nums[i]] = i;\n  }\n  return [];\n}",
      python: "def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n    return []",
      java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        java.util.Map<Integer, Integer> map = new java.util.HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            if (map.containsKey(target - nums[i])) return new int[]{map.get(target - nums[i]), i};\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int,int> m;\n        for (int i = 0; i < nums.size(); i++) {\n            if (m.count(target - nums[i])) return {m[target - nums[i]], i};\n            m[nums[i]] = i;\n        }\n        return {};\n    }\n};"
    },
    hints: ["Use a hash map to store complements for O(n) time complexity."]
  },
  {
    id: 2,
    title: "Binary Search",
    difficulty: "Easy",
    tags: ["Array", "Binary Search"],
    funcName: "search",
    description: "Given a sorted array of integers `nums` and a target value, return the index if found. If not, return -1.",
    examples: [
      { input: "[-1,0,3,5,9,12], 9", output: "4", explanation: "9 exists in nums and its index is 4" }
    ],
    starterCode: {
      javascript: "function search(nums, target) {\n  // Write your solution here\n  return -1;\n}",
      python: "def search(nums, target):\n    # Write your solution here\n    return -1",
      java: "class Solution {\n    public int search(int[] nums, int target) {\n        return -1;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        return -1;\n    }\n};"
    },
    testCases: [
      { input: "[-1,0,3,5,9,12], 9", expected: "4", type: "PUBLIC" },
      { input: "[-1,0,3,5,9,12], 2", expected: "-1", type: "PUBLIC" },
      { input: "[5], 5", expected: "0", type: "EDGE" },
      { input: "[1,2,3,4,5,6,7,8,9,10], 10", expected: "9", type: "HIDDEN" }
    ],
    referenceSolution: {
      javascript: "function search(nums, target) {\n  let l = 0, r = nums.length - 1;\n  while (l <= r) {\n    const m = Math.floor((l + r) / 2);\n    if (nums[m] === target) return m;\n    if (nums[m] < target) l = m + 1; else r = m - 1;\n  }\n  return -1;\n}",
      python: "def search(nums, target):\n    l, r = 0, len(nums) - 1\n    while l <= r:\n        m = (l + r) // 2\n        if nums[m] == target: return m\n        if nums[m] < target: l = m + 1\n        else: r = m - 1\n    return -1",
      java: "class Solution {\n    public int search(int[] nums, int target) {\n        int l = 0, r = nums.length - 1;\n        while (l <= r) {\n            int m = l + (r - l) / 2;\n            if (nums[m] == target) return m;\n            if (nums[m] < target) l = m + 1; else r = m - 1;\n        }\n        return -1;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        int l = 0, r = nums.size() - 1;\n        while (l <= r) {\n            int m = l + (r - l) / 2;\n            if (nums[m] == target) return m;\n            if (nums[m] < target) l = m + 1; else r = m - 1;\n        }\n        return -1;\n    }\n};"
    },
    hints: ["Use two pointers (left/right) and eliminate half the search space each iteration."]
  },
  {
    id: 3,
    title: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["Stack", "String"],
    funcName: "isValid",
    description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    examples: [
      { input: '"()[]{}"', output: "true", explanation: "All open brackets are closed by the same type of brackets in correct order." }
    ],
    starterCode: {
      javascript: "function isValid(s) {\n  // Write your solution here\n  return false;\n}",
      python: "def is_valid(s):\n    # Write your solution here\n    return False",
      java: "class Solution {\n    public boolean isValid(String s) {\n        return false;\n    }\n}",
      cpp: "class Solution {\npublic:\n    bool isValid(string s) {\n        return false;\n    }\n};"
    },
    testCases: [
      { input: '"()[]{}"', expected: "true", type: "PUBLIC" },
      { input: '"(]"', expected: "false", type: "PUBLIC" },
      { input: '"{[]}"', expected: "true", type: "HIDDEN" },
      { input: '""', expected: "true", type: "EDGE" }
    ]
  },
  {
    id: 4,
    title: "Reverse Linked List",
    difficulty: "Medium",
    tags: ["Linked List"],
    funcName: "reverseList",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    examples: [
      { input: "[1,2,3,4,5]", output: "[5,4,3,2,1]", explanation: "" }
    ],
    starterCode: {
      javascript: "function reverseList(head) {\n  // Write your solution here\n  return head;\n}",
      python: "def reverse_list(head):\n    # Write your solution here\n    return head",
      java: "class Solution {\n    public ListNode reverseList(ListNode head) {\n        return head;\n    }\n}",
      cpp: "class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        return head;\n    }\n};"
    },
    testCases: [
      { input: "[1,2,3,4,5]", expected: "[5,4,3,2,1]", type: "PUBLIC" },
      { input: "[1,2]", expected: "[2,1]", type: "PUBLIC" },
      { input: "[]", expected: "[]", type: "EDGE" }
    ]
  },
  {
    id: 5,
    title: "Maximum Subarray",
    difficulty: "Medium",
    tags: ["Array", "DP"],
    funcName: "maxSubArray",
    description: "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
    examples: [
      { input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "The subarray [4,-1,2,1] has the largest sum 6." }
    ],
    starterCode: {
      javascript: "function maxSubArray(nums) {\n  // Write your solution here\n  return 0;\n}",
      python: "def max_sub_array(nums):\n    # Write your solution here\n    return 0",
      java: "class Solution {\n    public int maxSubArray(int[] nums) {\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        return 0;\n    }\n};"
    },
    testCases: [
      { input: "[-2,1,-3,4,-1,2,1,-5,4]", expected: "6", type: "PUBLIC" },
      { input: "[1]", expected: "1", type: "PUBLIC" },
      { input: "[5,4,-1,7,8]", expected: "23", type: "HIDDEN" }
    ]
  },
  {
    id: 6,
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    tags: ["Linked List", "Recursion"],
    funcName: "mergeTwoLists",
    description: "Merge two sorted linked lists into one sorted list.",
    examples: [
      { input: "[1,2,4], [1,3,4]", output: "[1,1,2,3,4,4]", explanation: "" }
    ],
    starterCode: {
      javascript: "function mergeTwoLists(list1, list2) {\n  // Write your solution here\n  return list1;\n}",
      python: "def merge_two_lists(list1, list2):\n    # Write your solution here\n    return list1",
      java: "class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        return list1;\n    }\n}",
      cpp: "class Solution {\npublic:\n    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n        return list1;\n    }\n};"
    },
    testCases: [
      { input: "[1,2,4], [1,3,4]", expected: "[1,1,2,3,4,4]", type: "PUBLIC" },
      { input: "[], []", expected: "[]", type: "EDGE" }
    ]
  },
  {
    id: 7,
    title: "Climbing Stairs",
    difficulty: "Easy",
    tags: ["DP", "Math"],
    funcName: "climbStairs",
    description: "You are climbing a staircase. It takes `n` steps to reach the top. Each time you can climb 1 or 2 steps. How many distinct ways can you climb to the top?",
    examples: [
      { input: "3", output: "3", explanation: "1. 1+1+1 step\n2. 1+2 steps\n3. 2+1 steps" }
    ],
    starterCode: {
      javascript: "function climbStairs(n) {\n  // Write your solution here\n  return 0;\n}",
      python: "def climb_stairs(n):\n    # Write your solution here\n    return 0",
      java: "class Solution {\n    public int climbStairs(int n) {\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int climbStairs(int n) {\n        return 0;\n    }\n};"
    },
    testCases: [
      { input: "2", expected: "2", type: "PUBLIC" },
      { input: "3", expected: "3", type: "PUBLIC" },
      { input: "5", expected: "8", type: "HIDDEN" }
    ]
  },
  {
    id: 8,
    title: "Number of Islands",
    difficulty: "Hard",
    tags: ["Graph", "BFS", "DFS"],
    funcName: "numIslands",
    description: "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.",
    examples: [
      { input: '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', output: "1", explanation: "" }
    ],
    starterCode: {
      javascript: "function numIslands(grid) {\n  // Write your solution here\n  return 0;\n}",
      python: "def num_islands(grid):\n    # Write your solution here\n    return 0",
      java: "class Solution {\n    public int numIslands(char[][] grid) {\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        return 0;\n    }\n};"
    },
    testCases: [
      { input: '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', expected: "1", type: "PUBLIC" },
      { input: '[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', expected: "3", type: "PUBLIC" }
    ]
  }
];

async function seed() {
  try {
    const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/codeforge";
    console.log("Connecting to MongoDB for seeding...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");

    for (const p of rawProblems) {
      const problemDoc = await Problem.findOneAndUpdate(
        { problemId: p.id },
        {
          problemId: p.id,
          title: p.title,
          description: p.description,
          topic: p.tags[0] || "General",
          subtopic: p.tags[1] || "",
          difficulty: p.difficulty,
          tags: p.tags,
          funcName: p.funcName,
          examples: p.examples,
          starterCode: p.starterCode,
          referenceSolution: p.referenceSolution || {},
          hints: p.hints || [],
          status: "PUBLISHED",
        },
        { upsert: true, new: true }
      );

      // Clear existing test cases for this problem
      await TestCase.deleteMany({ numericProblemId: p.id });

      // Insert new test cases
      for (let i = 0; i < p.testCases.length; i++) {
        const tc = p.testCases[i];
        await TestCase.create({
          problemId: problemDoc._id,
          numericProblemId: p.id,
          input: tc.input,
          expectedOutput: tc.expected,
          type: tc.type || "PUBLIC",
          orderIndex: i + 1,
        });
      }

      console.log(`✓ Seeded Problem #${p.id}: ${p.title} (${p.testCases.length} test cases)`);
    }

    console.log("\n🎉 Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  }
}

seed();
