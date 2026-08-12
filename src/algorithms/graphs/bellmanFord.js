export const bellmanFordSearch = (inputArray, startNode = 0) => {
  const steps = [];
  
  // Graph layout - same as dijkstra, but edges are directed
  const initialNodes = [
    { id: 0, value: 'A', x: 200, y: 150, state: 'unvisited', dist: Infinity },
    { id: 1, value: 'B', x: 350, y: 80, state: 'unvisited', dist: Infinity },
    { id: 2, value: 'C', x: 350, y: 220, state: 'unvisited', dist: Infinity },
    { id: 3, value: 'D', x: 500, y: 80, state: 'unvisited', dist: Infinity },
    { id: 4, value: 'E', x: 500, y: 220, state: 'unvisited', dist: Infinity },
    { id: 5, value: 'F', x: 650, y: 150, state: 'unvisited', dist: Infinity }
  ];

  initialNodes[startNode].dist = 0;

  // Directed edges, let's include a negative weight just for fun
  // Note: D -> E is -2
  const edges = [
    { id: 0, source: 0, target: 1, weight: 4, highlighted: false },
    { id: 1, source: 0, target: 2, weight: 2, highlighted: false },
    { id: 2, source: 1, target: 3, weight: -1, highlighted: false },
    { id: 3, source: 2, target: 1, weight: 1, highlighted: false },
    { id: 4, source: 2, target: 4, weight: 3, highlighted: false },
    { id: 5, source: 3, target: 5, weight: 4, highlighted: false },
    { id: 6, source: 4, target: 3, weight: -2, highlighted: false },
    { id: 7, source: 4, target: 5, weight: 2, highlighted: false }
  ];

  steps.push({
    nodes: JSON.parse(JSON.stringify(initialNodes)),
    edges: JSON.parse(JSON.stringify(edges)),
    activeNode: -1,
    description: `Starting Bellman-Ford Algorithm from node <strong>${initialNodes[startNode].value}</strong>. We have ${initialNodes.length} vertices, so we will relax all edges ${initialNodes.length - 1} times.`,
    highlightLines: [1, 2, 3]
  });

  let currentNodes = JSON.parse(JSON.stringify(initialNodes));
  let currentEdges = JSON.parse(JSON.stringify(edges));

  const V = initialNodes.length;
  
  for (let i = 1; i <= V - 1; i++) {
    steps.push({
      nodes: JSON.parse(JSON.stringify(currentNodes)),
      edges: JSON.parse(JSON.stringify(currentEdges)),
      activeNode: -1,
      description: `<strong>Iteration ${i} out of ${V - 1}:</strong> Relaxing all edges.`,
      highlightLines: [5]
    });

    for (let j = 0; j < edges.length; j++) {
      const edge = edges[j];
      const u = edge.source;
      const v = edge.target;
      const weight = edge.weight;

      currentNodes[u].state = 'active';
      currentEdges[j].highlighted = true;

      steps.push({
        nodes: JSON.parse(JSON.stringify(currentNodes)),
        edges: JSON.parse(JSON.stringify(currentEdges)),
        activeNode: u,
        description: `Checking edge <strong>${initialNodes[u].value} -> ${initialNodes[v].value}</strong> (Weight: ${weight}).`,
        highlightLines: [7]
      });

      if (currentNodes[u].dist !== Infinity && currentNodes[u].dist + weight < currentNodes[v].dist) {
        currentNodes[v].dist = currentNodes[u].dist + weight;
        currentNodes[v].state = 'queue';
        
        steps.push({
          nodes: JSON.parse(JSON.stringify(currentNodes)),
          edges: JSON.parse(JSON.stringify(currentEdges)),
          activeNode: v,
          description: `Relaxed edge! New shorter path to <strong>${initialNodes[v].value}</strong> is ${currentNodes[v].dist}.`,
          highlightLines: [8, 9]
        });
        currentNodes[v].state = 'visited';
      } else {
        steps.push({
           nodes: JSON.parse(JSON.stringify(currentNodes)),
           edges: JSON.parse(JSON.stringify(currentEdges)),
           activeNode: u,
           description: `No update. Distance via <strong>${initialNodes[u].value}</strong> is not shorter.`,
           highlightLines: [8]
        });
      }

      currentNodes[u].state = 'visited';
      currentEdges[j].highlighted = false;
    }
  }

  // Check for negative-weight cycles
  steps.push({
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    edges: JSON.parse(JSON.stringify(currentEdges)),
    activeNode: -1,
    description: `Checking for negative-weight cycles by doing one last relaxation pass.`,
    highlightLines: [13]
  });

  let cycleFound = false;
  for (let j = 0; j < edges.length; j++) {
    const edge = edges[j];
    const u = edge.source;
    const v = edge.target;
    const weight = edge.weight;

    if (currentNodes[u].dist !== Infinity && currentNodes[u].dist + weight < currentNodes[v].dist) {
      cycleFound = true;
      currentEdges[j].highlighted = true;
      steps.push({
        nodes: JSON.parse(JSON.stringify(currentNodes)),
        edges: JSON.parse(JSON.stringify(currentEdges)),
        activeNode: u,
        description: `Found negative weight cycle affecting edge <strong>${initialNodes[u].value} -> ${initialNodes[v].value}</strong>!`,
        highlightLines: [14, 15]
      });
      break;
    }
  }

  steps.push({
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    edges: JSON.parse(JSON.stringify(currentEdges)),
    activeNode: -1,
    description: cycleFound ? `Bellman-Ford detected a negative weight cycle.` : `Bellman-Ford complete. No negative cycles found.`,
    highlightLines: []
  });

  return steps;
};

export const bellmanFordCode = [
  "function bellmanFord(nodes, edges, start) {",
  "  const distances = Array(nodes.length).fill(Infinity);",
  "  distances[start] = 0;",
  "  ",
  "  for (let i = 0; i < nodes.length - 1; i++) {",
  "    for (const {u, v, weight} of edges) {",
  "      if (distances[u] !== Infinity && distances[u] + weight < distances[v]) {",
  "        distances[v] = distances[u] + weight;",
  "      }",
  "    }",
  "  }",
  "  ",
  "  for (const {u, v, weight} of edges) {",
  "    if (distances[u] !== Infinity && distances[u] + weight < distances[v]) {",
  "      return null; // Negative cycle detected",
  "    }",
  "  }",
  "  return distances;",
  "}"
];

export const bellmanFordComplexity = {
  best: "Ω(V * E)",
  average: "Θ(V * E)",
  worst: "O(V * E)", 
  space: "O(V)" 
};
