export const avlSearch = (inputArray, target = 50) => {
  const steps = [];
  
  // Simulated rotation for an unbalanced AVL tree insert:
  // Inserting 70, 60, 50 -> requires Right Rotation
  const initialNodes = [
    { id: 0, value: 70, x: 300, y: 50, state: 'unvisited' },
    { id: 1, value: 60, x: 200, y: 120, state: 'unvisited' },
    { id: 2, value: 50, x: 100, y: 190, state: 'unvisited' }
  ];

  const initialEdges = [
    { id: 0, source: 0, target: 1, x1: 300, y1: 50, x2: 200, y2: 120, highlighted: false },
    { id: 1, source: 1, target: 2, x1: 200, y1: 120, x2: 100, y2: 190, highlighted: false }
  ];

  steps.push({
    nodes: JSON.parse(JSON.stringify(initialNodes)),
    edges: JSON.parse(JSON.stringify(initialEdges)),
    activeNode: -1,
    description: `Starting AVL Tree operations. We just inserted <strong>50</strong>. The tree is now unbalanced (Left-Left Heavy).`,
    highlightLines: [1, 2]
  });

  const unbalancedNodes = JSON.parse(JSON.stringify(initialNodes));
  unbalancedNodes[0].state = 'active'; // 70 is unbalanced
  unbalancedNodes[1].state = 'queue'; // 60 is pivot

  steps.push({
    nodes: JSON.parse(JSON.stringify(unbalancedNodes)),
    edges: JSON.parse(JSON.stringify(initialEdges)),
    activeNode: 0,
    description: `Node <strong>70</strong> has a balance factor of +2. This requires a <strong>Right Rotation</strong> around pivot <strong>60</strong>.`,
    highlightLines: [3]
  });

  const rotatedNodes = [
    { id: 0, value: 70, x: 400, y: 120, state: 'unvisited' }, // 70 becomes right child
    { id: 1, value: 60, x: 300, y: 50, state: 'visited' },  // 60 becomes root
    { id: 2, value: 50, x: 200, y: 120, state: 'unvisited' } // 50 stays left child of 60
  ];

  const rotatedEdges = [
    { id: 0, source: 1, target: 0, x1: 300, y1: 50, x2: 400, y2: 120, highlighted: true },
    { id: 1, source: 1, target: 2, x1: 300, y1: 50, x2: 200, y2: 120, highlighted: false }
  ];

  steps.push({
    nodes: JSON.parse(JSON.stringify(rotatedNodes)),
    edges: JSON.parse(JSON.stringify(rotatedEdges)),
    activeNode: 1,
    description: `Right Rotation complete! <strong>60</strong> is the new root, <strong>70</strong> is its right child, and the tree is balanced.`,
    highlightLines: [6, 7, 8]
  });

  // Now perform search
  steps.push({
    nodes: JSON.parse(JSON.stringify(rotatedNodes)),
    edges: JSON.parse(JSON.stringify(rotatedEdges)),
    activeNode: -1,
    description: `Proceeding with standard BST search for target <strong>${target}</strong>.`,
    highlightLines: [12, 13]
  });

  rotatedEdges[0].highlighted = false;

  const searchRootNodes = JSON.parse(JSON.stringify(rotatedNodes));
  searchRootNodes[1].state = 'active';

  steps.push({
    nodes: JSON.parse(JSON.stringify(searchRootNodes)),
    edges: JSON.parse(JSON.stringify(rotatedEdges)),
    activeNode: 1,
    description: `Checking root node <strong>60</strong>. It is greater than <strong>${target}</strong>, so we go left.`,
    highlightLines: [14, 15]
  });

  rotatedEdges[1].highlighted = true;
  const searchLeftNodes = JSON.parse(JSON.stringify(rotatedNodes));
  searchLeftNodes[2].state = 'active';

  steps.push({
    nodes: JSON.parse(JSON.stringify(searchLeftNodes)),
    edges: JSON.parse(JSON.stringify(rotatedEdges)),
    activeNode: 2,
    description: `Checking node <strong>50</strong>. It matches the target! Search successful.`,
    highlightLines: [17]
  });

  return steps;
};

export const avlCode = [
  "function rightRotate(y) {",
  "  let x = y.left;",
  "  let T2 = x.right;",
  "  x.right = y;",
  "  y.left = T2;",
  "  y.height = Math.max(height(y.left), height(y.right)) + 1;",
  "  x.height = Math.max(height(x.left), height(x.right)) + 1;",
  "  return x;",
  "}",
  "",
  "function searchAVL(root, target) {",
  "  if (!root) return null;",
  "  if (root.val === target) return root;",
  "  if (target < root.val) return searchAVL(root.left, target);",
  "  return searchAVL(root.right, target);",
  "}"
];

export const avlComplexity = {
  best: "Ω(log n)",
  average: "Θ(log n)",
  worst: "O(log n)", 
  space: "O(log n)" 
};
