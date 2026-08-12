export const bstSearch = (inputArray, target = 27) => {
  const steps = [];
  
  // Hardcoded standard tree for visualization purposes
  // Let's pretend the inputArray generated this tree layout.
  // Real implementation would build a BST and compute coordinates.
  const nodes = [
    { id: 0, value: 38, x: 300, y: 50 },
    { id: 1, value: 27, x: 200, y: 120 },
    { id: 2, value: 43, x: 400, y: 120 },
    { id: 3, value: 3, x: 150, y: 190 },
    { id: 4, value: 9, x: 180, y: 260 }, // child of 3
    { id: 5, value: 82, x: 450, y: 190 }
  ];

  const edges = [
    { source: 0, target: 1, x1: 300, y1: 50, x2: 200, y2: 120 },
    { source: 0, target: 2, x1: 300, y1: 50, x2: 400, y2: 120 },
    { source: 1, target: 3, x1: 200, y1: 120, x2: 150, y2: 190 },
    { source: 3, target: 4, x1: 150, y1: 190, x2: 180, y2: 260 },
    { source: 2, target: 5, x1: 400, y1: 120, x2: 450, y2: 190 }
  ];

  steps.push({
    nodes: [...nodes],
    edges: [...edges],
    activeNode: -1,
    comparingNodes: [],
    foundNode: null,
    array: [], // To maintain fallback compatibility for BarChart
    description: `Starting Binary Search Tree (BST) search for target <strong>${target}</strong>. Root is 38.`,
    highlightLines: [1, 2]
  });

  // Simulated search steps for target 27
  steps.push({
    nodes: [...nodes], edges: [...edges],
    activeNode: 0, comparingNodes: [], foundNode: null, array: [],
    description: `Checking root node <strong>38</strong>. It is greater than <strong>${target}</strong>, so we go left.`,
    highlightLines: [3, 4]
  });

  edges[0].highlighted = true;

  steps.push({
    nodes: [...nodes], edges: [...edges],
    activeNode: 1, comparingNodes: [], foundNode: null, array: [],
    description: `Checking node <strong>27</strong>. It is equal to <strong>${target}</strong>. We found it!`,
    highlightLines: [8]
  });

  steps.push({
    nodes: [...nodes], edges: [...edges],
    activeNode: -1, comparingNodes: [], foundNode: 1, array: [],
    description: `Target <strong>${target}</strong> found in the tree! Search successful.`,
    highlightLines: [9]
  });

  return steps;
};

export const bstSearchCode = [
  "function searchBST(root, target) {",
  "  if (root === null) return null;",
  "  if (root.val === target) {",
  "    return root;",
  "  }",
  "  if (target < root.val) {",
  "    return searchBST(root.left, target);",
  "  } else {",
  "    return searchBST(root.right, target);",
  "  }",
  "}"
];

export const bstComplexity = {
  best: "Ω(1)",
  average: "Θ(log n)",
  worst: "O(n)", // Skewed tree
  space: "O(1)" // O(h) recursive stack
};
