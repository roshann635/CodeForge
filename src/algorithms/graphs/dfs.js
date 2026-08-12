export const dfsSearch = (inputArray, startNode = 0) => {
  const steps = [];
  
  // Hardcoded graph layout for basic visualization
  const initialNodes = [
    { id: 0, value: 'A', x: 300, y: 100, state: 'unvisited' },
    { id: 1, value: 'B', x: 150, y: 150, state: 'unvisited' },
    { id: 2, value: 'C', x: 450, y: 150, state: 'unvisited' },
    { id: 3, value: 'D', x: 150, y: 280, state: 'unvisited' },
    { id: 4, value: 'E', x: 300, y: 230, state: 'unvisited' },
    { id: 5, value: 'F', x: 450, y: 280, state: 'unvisited' }
  ];

  const edges = [
    { source: 0, target: 1, highlighted: false },
    { source: 0, target: 2, highlighted: false },
    { source: 1, target: 3, highlighted: false },
    { source: 1, target: 4, highlighted: false },
    { source: 2, target: 4, highlighted: false },
    { source: 2, target: 5, highlighted: false }
  ];

  // Adjacency List for actual traversal logic
  const adjList = {
    0: [1, 2],
    1: [0, 3, 4],
    2: [0, 4, 5],
    3: [1],
    4: [1, 2],
    5: [2]
  };

  steps.push({
    nodes: JSON.parse(JSON.stringify(initialNodes)),
    edges: JSON.parse(JSON.stringify(edges)),
    activeNode: -1,
    description: `Starting Depth-First Search (DFS) from node <strong>${initialNodes[startNode].value}</strong>.`,
    highlightLines: [1, 2]
  });

  const visited = new Set();
  
  let currentNodes = JSON.parse(JSON.stringify(initialNodes));
  let currentEdges = JSON.parse(JSON.stringify(edges));

  const dfs = (node) => {
    visited.add(node);
    currentNodes[node].state = 'active';

    steps.push({
      nodes: JSON.parse(JSON.stringify(currentNodes)),
      edges: JSON.parse(JSON.stringify(currentEdges)),
      activeNode: node,
      description: `Visited node <strong>${initialNodes[node].value}</strong>.`,
      highlightLines: [4, 5]
    });

    currentNodes[node].state = 'visited';

    for (let neighbor of adjList[node]) {
      steps.push({
        nodes: JSON.parse(JSON.stringify(currentNodes)),
        edges: JSON.parse(JSON.stringify(currentEdges)),
        activeNode: node,
        description: `Checking neighbor <strong>${initialNodes[neighbor].value}</strong> of node <strong>${initialNodes[node].value}</strong>.`,
        highlightLines: [6] // for (const neighbor of graph[node])
      });

      if (!visited.has(neighbor)) {
        let edge = currentEdges.find(e => (e.source === node && e.target === neighbor) || (e.source === neighbor && e.target === node));
        if(edge) edge.highlighted = true;

        steps.push({
          nodes: JSON.parse(JSON.stringify(currentNodes)),
          edges: JSON.parse(JSON.stringify(currentEdges)),
          activeNode: node,
          description: `Neighbor <strong>${initialNodes[neighbor].value}</strong> is unvisited. Recursing into it.`,
          highlightLines: [7, 8] // if (!visited.has(neighbor)) { dfs(neighbor) }
        });

        dfs(neighbor);
      } else {
        steps.push({
          nodes: JSON.parse(JSON.stringify(currentNodes)),
          edges: JSON.parse(JSON.stringify(currentEdges)),
          activeNode: node,
          description: `Neighbor <strong>${initialNodes[neighbor].value}</strong> is already visited. Skipping.`,
          highlightLines: [7]
        });
      }
    }

    steps.push({
      nodes: JSON.parse(JSON.stringify(currentNodes)),
      edges: JSON.parse(JSON.stringify(currentEdges)),
      activeNode: node,
      description: `Finished processing all neighbors of <strong>${initialNodes[node].value}</strong>. Backtracking.`,
      highlightLines: [10]
    });
  };

  dfs(startNode);

  steps.push({
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    edges: JSON.parse(JSON.stringify(currentEdges)),
    activeNode: -1,
    description: `DFS Traversal complete!`,
    highlightLines: []
  });

  return steps;
};

export const dfsCode = [
  "function dfs(graph, start) {",
  "  const visited = new Set();",
  "  ",
  "  function explore(node) {",
  "    visited.add(node);",
  "    // process node",
  "    for (const neighbor of graph[node]) {",
  "      if (!visited.has(neighbor)) {",
  "        explore(neighbor);",
  "      }",
  "    }",
  "  }",
  "  ",
  "  explore(start);",
  "}"
];

export const dfsComplexity = {
  best: "Ω(V + E)",
  average: "Θ(V + E)",
  worst: "O(V + E)", 
  space: "O(V)" 
};
