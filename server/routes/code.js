const express = require("express");
const router = express.Router();

// ============================================
// Real Code Execution Engine via Piston API
// ============================================

const PISTON_API = "https://emkc.org/api/v2/piston/execute";

const LANGUAGE_CONFIG = {
  javascript: { language: "javascript", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
  cpp: { language: "c++", version: "10.2.0" },
};

// Test case runner wrappers — these wrap user code to actually run test cases
const TEST_WRAPPERS = {
  javascript: {
    twoSum: (userCode, input) => {
      const [arr, target] = input.split("], ").map((s, i) => i === 0 ? s + "]" : s);
      return `${userCode}\nconst result = twoSum(${arr}, ${target});\nconsole.log(JSON.stringify(result));`;
    },
    search: (userCode, input) => {
      const [arr, target] = input.split("], ").map((s, i) => i === 0 ? s + "]" : s);
      return `${userCode}\nconst result = search(${arr}, ${target});\nconsole.log(JSON.stringify(result));`;
    },
    isValid: (userCode, input) => {
      return `${userCode}\nconst result = isValid(${input});\nconsole.log(JSON.stringify(result));`;
    },
    maxSubArray: (userCode, input) => {
      return `${userCode}\nconst result = maxSubArray(${input});\nconsole.log(JSON.stringify(result));`;
    },
    climbStairs: (userCode, input) => {
      return `${userCode}\nconst result = climbStairs(${input});\nconsole.log(JSON.stringify(result));`;
    },
    numIslands: (userCode, input) => {
      return `${userCode}\nconst result = numIslands(${input});\nconsole.log(JSON.stringify(result));`;
    },
    reverseList: (userCode, input) => {
      return `${userCode}
// Helper to build linked list from array
function buildList(arr) {
  if (!arr.length) return null;
  let head = { val: arr[0], next: null };
  let current = head;
  for (let i = 1; i < arr.length; i++) {
    current.next = { val: arr[i], next: null };
    current = current.next;
  }
  return head;
}
function listToArray(head) {
  const result = [];
  while (head) { result.push(head.val); head = head.next; }
  return result;
}
const head = buildList(${input});
const result = reverseList(head);
console.log(JSON.stringify(listToArray(result)));`;
    },
    mergeTwoLists: (userCode, input) => {
      const parts = input.split("], ");
      const l1 = parts[0] + "]";
      const l2 = parts[1];
      return `${userCode}
function buildList(arr) {
  if (!arr.length) return null;
  let head = { val: arr[0], next: null };
  let current = head;
  for (let i = 1; i < arr.length; i++) {
    current.next = { val: arr[i], next: null };
    current = current.next;
  }
  return head;
}
function listToArray(head) {
  const result = [];
  while (head) { result.push(head.val); head = head.next; }
  return result;
}
const l1 = buildList(${l1});
const l2 = buildList(${l2});
const result = mergeTwoLists(l1, l2);
console.log(JSON.stringify(listToArray(result)));`;
    }
  },
  python: {
    twoSum: (userCode, input) => {
      const [arr, target] = input.split("], ").map((s, i) => i === 0 ? s + "]" : s);
      return `import json\n${userCode}\nresult = two_sum(${arr}, ${target.trim()})\nprint(json.dumps(result))`;
    },
    search: (userCode, input) => {
      const [arr, target] = input.split("], ").map((s, i) => i === 0 ? s + "]" : s);
      return `import json\n${userCode}\nresult = search(${arr}, ${target.trim()})\nprint(json.dumps(result))`;
    },
    isValid: (userCode, input) => {
      return `import json\n${userCode}\nresult = is_valid(${input})\nprint(json.dumps(result))`;
    },
    maxSubArray: (userCode, input) => {
      return `import json\n${userCode}\nresult = max_sub_array(${input})\nprint(json.dumps(result))`;
    },
    climbStairs: (userCode, input) => {
      return `import json\n${userCode}\nresult = climb_stairs(${input})\nprint(json.dumps(result))`;
    },
    numIslands: (userCode, input) => {
      return `import json\n${userCode}\nresult = num_islands(${input})\nprint(json.dumps(result))`;
    },
    reverseList: (userCode, input) => {
      return `import json
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
def build_list(arr):
    if not arr: return None
    head = ListNode(arr[0])
    curr = head
    for v in arr[1:]:
        curr.next = ListNode(v)
        curr = curr.next
    return head
def list_to_array(head):
    result = []
    while head:
        result.append(head.val)
        head = head.next
    return result
${userCode}
head = build_list(${input})
result = reverse_list(head)
print(json.dumps(list_to_array(result)))`;
    },
    mergeTwoLists: (userCode, input) => {
      const parts = input.split("], ");
      const l1 = parts[0] + "]";
      const l2 = parts[1];
      return `import json
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
def build_list(arr):
    if not arr: return None
    head = ListNode(arr[0])
    curr = head
    for v in arr[1:]:
        curr.next = ListNode(v)
        curr = curr.next
    return head
def list_to_array(head):
    result = []
    while head:
        result.append(head.val)
        head = head.next
    return result
${userCode}
l1 = build_list(${l1})
l2 = build_list(${l2})
result = merge_two_lists(l1, l2)
print(json.dumps(list_to_array(result)))`;
    }
  }
};

// Map problem IDs to function names for wrapping
const PROBLEM_FUNC_MAP = {
  1: "twoSum",
  2: "search",
  3: "isValid",
  4: "reverseList",
  5: "maxSubArray",
  6: "mergeTwoLists",
  7: "climbStairs",
  8: "numIslands",
};

const PYTHON_FUNC_MAP = {
  1: "twoSum",
  2: "search",
  3: "isValid",
  4: "reverseList",
  5: "maxSubArray",
  6: "mergeTwoLists",
  7: "climbStairs",
  8: "numIslands",
};

/**
 * POST /code/run — Run code against a single test case (quick feedback)
 */
router.post("/run", async (req, res) => {
  try {
    const { code, language, problemId, testCase } = req.body;
    if (!code || !language) {
      return res.status(400).json({ error: "Code and language are required" });
    }

    const langConfig = LANGUAGE_CONFIG[language];
    if (!langConfig) {
      return res.status(400).json({ error: `Unsupported language: ${language}` });
    }

    // If there's a test case and problem ID, wrap the code
    let execCode = code;
    const funcName = PROBLEM_FUNC_MAP[problemId];

    if (testCase && funcName) {
      const lang = language === "cpp" ? null : language;
      const wrappers = TEST_WRAPPERS[lang];
      if (wrappers && wrappers[funcName]) {
        execCode = wrappers[funcName](code, testCase.input);
      }
    }

    const startTime = Date.now();
    const pistonRes = await fetch(PISTON_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: langConfig.language,
        version: langConfig.version,
        files: [{ content: execCode }],
      }),
    });
    const elapsed = Date.now() - startTime;
    const pistonData = await pistonRes.json();

    if (!pistonData.run) {
      return res.json({
        status: "error",
        output: pistonData.message || "Execution failed",
        runtime: 0,
      });
    }

    const stdout = (pistonData.run.stdout || "").trim();
    const stderr = (pistonData.run.stderr || "").trim();

    if (pistonData.run.code !== 0) {
      return res.json({
        status: "error",
        output: stderr || stdout,
        runtime: elapsed,
        error: "Runtime/compilation error",
      });
    }

    // Compare output if we have expected
    let passed = false;
    if (testCase && testCase.expected) {
      passed = normalizeOutput(stdout) === normalizeOutput(testCase.expected);
    }

    res.json({
      status: passed ? "passed" : "wrong_answer",
      output: stdout,
      expected: testCase?.expected || null,
      passed,
      runtime: elapsed,
    });
  } catch (error) {
    console.error("Code run error:", error);
    res.status(500).json({ error: "Code execution failed" });
  }
});

/**
 * POST /code/submit — Run code against ALL test cases for a problem
 * Returns detailed verdict per test case
 */
router.post("/submit", async (req, res) => {
  try {
    const { code, language, problemId, testCases } = req.body;
    if (!code || !language || !testCases) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const langConfig = LANGUAGE_CONFIG[language];
    if (!langConfig) {
      return res.status(400).json({ error: `Unsupported language: ${language}` });
    }

    const funcName = PROBLEM_FUNC_MAP[problemId];
    const lang = language === "cpp" ? null : language;
    const wrappers = TEST_WRAPPERS[lang];

    const results = [];
    let totalPassed = 0;
    let totalRuntime = 0;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      let execCode = code;

      if (funcName && wrappers && wrappers[funcName]) {
        execCode = wrappers[funcName](code, tc.input);
      }

      try {
        const startTime = Date.now();
        const pistonRes = await fetch(PISTON_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: langConfig.language,
            version: langConfig.version,
            files: [{ content: execCode }],
          }),
        });
        const elapsed = Date.now() - startTime;
        totalRuntime += elapsed;
        const pistonData = await pistonRes.json();

        if (!pistonData.run || pistonData.run.code !== 0) {
          const errorMsg = pistonData.run
            ? (pistonData.run.stderr || pistonData.run.stdout || "Runtime error")
            : (pistonData.message || "Execution failed");
          results.push({
            testCase: i + 1,
            input: tc.input,
            expected: tc.expected,
            actual: null,
            passed: false,
            runtime: elapsed,
            error: errorMsg.trim(),
          });
          continue;
        }

        const stdout = (pistonData.run.stdout || "").trim();
        const passed = normalizeOutput(stdout) === normalizeOutput(tc.expected);
        if (passed) totalPassed++;

        results.push({
          testCase: i + 1,
          input: tc.input,
          expected: tc.expected,
          actual: stdout,
          passed,
          runtime: elapsed,
          error: null,
        });
      } catch (err) {
        results.push({
          testCase: i + 1,
          input: tc.input,
          expected: tc.expected,
          actual: null,
          passed: false,
          runtime: 0,
          error: "Execution timeout or network error",
        });
      }
    }

    const allPassed = totalPassed === testCases.length;

    res.json({
      status: allPassed ? "accepted" : "wrong_answer",
      passed: totalPassed,
      total: testCases.length,
      passPercentage: Math.round((totalPassed / testCases.length) * 100),
      totalRuntime,
      avgRuntime: Math.round(totalRuntime / testCases.length),
      results,
      failed_cases: results.filter((r) => !r.passed),
    });
  } catch (error) {
    console.error("Code submit error:", error);
    res.status(500).json({ error: "Code submission failed" });
  }
});

/**
 * Normalize output for comparison — handles whitespace, quotes, brackets
 */
function normalizeOutput(str) {
  if (!str) return "";
  return str
    .replace(/\s+/g, "")
    .replace(/'/g, '"')
    .replace(/True/g, "true")
    .replace(/False/g, "false")
    .replace(/None/g, "null")
    .toLowerCase();
}

module.exports = router;
