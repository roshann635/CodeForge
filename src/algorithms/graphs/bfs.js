export const bfsSearch = (inputArray, startNode = 0) => {
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
    description: `Starting Breadth-First Search (BFS) from node <strong>${initialNodes[startNode].value}</strong>.`,
    highlightLines: [1, 2]
  });

  const visited = new Set();
  const queue = [startNode];
  
  let currentNodes = JSON.parse(JSON.stringify(initialNodes));
  let currentEdges = JSON.parse(JSON.stringify(edges));

  currentNodes[startNode].state = 'queue';
  
  steps.push({
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    edges: JSON.parse(JSON.stringify(currentEdges)),
    activeNode: -1,
    description: `Enqueued start node <strong>${initialNodes[startNode].value}</strong>.`,
    highlightLines: [3]
  });

  visited.add(startNode);

  while (queue.length > 0) {
    const curr = queue.shift();
    currentNodes[curr].state = 'active';

    steps.push({
      nodes: JSON.parse(JSON.stringify(currentNodes)),
      edges: JSON.parse(JSON.stringify(currentEdges)),
      activeNode: curr,
      description: `Dequeued <strong>${initialNodes[curr].value}</strong>. Setting to active/visited.`,
      highlightLines: [5, 6]
    });

    currentNodes[curr].state = 'visited';

    for (let neighbor of adjList[curr]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
        currentNodes[neighbor].state = 'queue';
        
        let edge = currentEdges.find(e => (e.source === curr && e.target === neighbor) || (e.source === neighbor && e.target === curr));
        if(edge) edge.highlighted = true;

        steps.push({
          nodes: JSON.parse(JSON.stringify(currentNodes)),
          edges: JSON.parse(JSON.stringify(currentEdges)),
          activeNode: curr,
          description: `Discovered unvisited neighbor <strong>${initialNodes[neighbor].value}</strong>. Enqueuing it.`,
          highlightLines: [8, 9, 10]
        });
      }
    }
  }

  steps.push({
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    edges: JSON.parse(JSON.stringify(currentEdges)),
    activeNode: -1,
    description: `Queue is empty. BFS Traversal complete!`,
    highlightLines: [13]
  });

  return steps;
};

export const bfsCode = [
  "function bfs(graph, start) {",
  "  const visited = new Set();",
  "  const queue = [start];",
  "  visited.add(start);",
  "  while (queue.length > 0) {",
  "    const node = queue.shift();",
  "    // process node",
  "    for (const neighbor of graph[node]) {",
  "      if (!visited.has(neighbor)) {",
  "        visited.add(neighbor);",
  "        queue.push(neighbor);",
  "      }",
  "    }",
  "  }",
  "}"
];

export const bfsComplexity = {
  best: "Ω(V + E)",
  average: "Θ(V + E)",
  worst: "O(V + E)", 
  space: "O(V)" 
};
