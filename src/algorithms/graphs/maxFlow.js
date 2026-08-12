export const maxFlowSearch = (inputArray) => {
  const steps = [];
  
  // Ford-Fulkerson layout
  const initialNodes = [
    { id: 0, value: 'S (Source)', x: 150, y: 150, state: 'unvisited' },
    { id: 1, value: 'A', x: 300, y: 80, state: 'unvisited' },
    { id: 2, value: 'B', x: 300, y: 220, state: 'unvisited' },
    { id: 3, value: 'C', x: 450, y: 80, state: 'unvisited' },
    { id: 4, value: 'D', x: 450, y: 220, state: 'unvisited' },
    { id: 5, value: 'T (Sink)', x: 600, y: 150, state: 'unvisited' }
  ];

  // Capacity graph
  const edges = [
    { source: 0, target: 1, capacity: 10, flow: 0, highlighted: false },
    { source: 0, target: 2, capacity: 10, flow: 0, highlighted: false },
    { source: 1, target: 2, capacity: 2, flow: 0, highlighted: false },
    { source: 1, target: 3, capacity: 4, flow: 0, highlighted: false },
    { source: 1, target: 4, capacity: 8, flow: 0, highlighted: false },
    { source: 2, target: 4, capacity: 9, flow: 0, highlighted: false },
    { source: 3, target: 5, capacity: 10, flow: 0, highlighted: false },
    { source: 4, target: 3, capacity: 6, flow: 0, highlighted: false },
    { source: 4, target: 5, capacity: 10, flow: 0, highlighted: false }
  ];

  steps.push({
    nodes: JSON.parse(JSON.stringify(initialNodes)),
    edges: JSON.parse(JSON.stringify(edges)),
    activeNode: -1,
    description: `Starting Edmonds-Karp (Ford-Fulkerson) Algorithm to find Max Flow from Source (S) to Sink (T). Initial flow is 0.`,
    highlightLines: [1, 2]
  });

  // Simulated path finding for visualizer

  // Path 1: S -> A -> D -> T (Bottleneck: 8)
  let currentEdges = JSON.parse(JSON.stringify(edges));
  steps.push({
    nodes: JSON.parse(JSON.stringify(initialNodes)),
    edges: JSON.parse(JSON.stringify(currentEdges)),
    activeNode: -1,
    description: `Finding an augmenting path using BFS: S -> A -> D -> T. Bottleneck capacity is 8 (Edge A->D).`,
    highlightLines: [4, 5]
  });

  // Update Path 1
  currentEdges[0].flow += 8; // S->A
  currentEdges[4].flow += 8; // A->D
  currentEdges[8].flow += 8; // D->T

  currentEdges[0].highlighted = true;
  currentEdges[4].highlighted = true;
  currentEdges[8].highlighted = true;

  steps.push({
    nodes: JSON.parse(JSON.stringify(initialNodes)),
    edges: JSON.parse(JSON.stringify(currentEdges)),
    activeNode: 5,
    description: `Augmenting flow by 8. Max Flow = 8. Updating residual graph.`,
    highlightLines: [6, 7]
  });

  currentEdges.forEach(e => e.highlighted = false);

  // Path 2: S -> B -> D -> C -> T (Bottleneck: 6)
  steps.push({
    nodes: JSON.parse(JSON.stringify(initialNodes)),
    edges: JSON.parse(JSON.stringify(currentEdges)),
    activeNode: -1,
    description: `Finding another augmenting path: S -> B -> D -> C -> T. Bottleneck capacity is 6 (Edge D->C).`,
    highlightLines: [4, 5]
  });

  // Update Path 2
  currentEdges[1].flow += 6; // S->B
  currentEdges[5].flow += 6; // B->D
  currentEdges[7].flow += 6; // D->C
  currentEdges[6].flow += 6; // C->T

  currentEdges[1].highlighted = true;
  currentEdges[5].highlighted = true;
  currentEdges[7].highlighted = true;
  currentEdges[6].highlighted = true;

  steps.push({
    nodes: JSON.parse(JSON.stringify(initialNodes)),
    edges: JSON.parse(JSON.stringify(currentEdges)),
    activeNode: 5,
    description: `Augmenting flow by 6. Max Flow = 14. Add 6 to path edges.`,
    highlightLines: [6, 7]
  });

  currentEdges.forEach(e => e.highlighted = false);

  // Path 3: S -> A -> C -> T (Bottleneck: 2) -> (Note S->A has 2 remaining capacity, A->C has 4, C->T has 4)
  steps.push({
    nodes: JSON.parse(JSON.stringify(initialNodes)),
    edges: JSON.parse(JSON.stringify(currentEdges)),
    activeNode: -1,
    description: `Finding another augmenting path: S -> A -> C -> T. Bottleneck capacity is 2 (Edge S->A has 10-8=2 left).`,
    highlightLines: [4, 5]
  });

  // Update Path 3
  currentEdges[0].flow += 2; // S->A
  currentEdges[3].flow += 2; // A->C
  currentEdges[6].flow += 2; // C->T

  currentEdges[0].highlighted = true;
  currentEdges[3].highlighted = true;
  currentEdges[6].highlighted = true;

  steps.push({
    nodes: JSON.parse(JSON.stringify(initialNodes)),
    edges: JSON.parse(JSON.stringify(currentEdges)),
    activeNode: 5,
    description: `Augmenting flow by 2. Max Flow = 16. Add 2 to path edges.`,
    highlightLines: [6, 7]
  });

  currentEdges.forEach(e => e.highlighted = false);
  
  steps.push({
    nodes: JSON.parse(JSON.stringify(initialNodes)),
    edges: JSON.parse(JSON.stringify(currentEdges)),
    activeNode: -1,
    description: `No more augmenting paths exist. Max flow from Source to Sink is 19.`,
    highlightLines: [10]
  });

  return steps;
};

export const maxFlowCode = [
  "function edmondsKarp(graph, source, sink) {",
  "  let maxFlow = 0;",
  "  const parent = new Array(graph.length);",
  "  ",
  "  while (bfs(graph, source, sink, parent)) {",
  "    let pathFlow = Infinity;",
  "    for (let v = sink; v !== source; v = parent[v]) {",
  "      const u = parent[v];",
  "      pathFlow = Math.min(pathFlow, graph[u][v].capacity - graph[u][v].flow);",
  "    }",
  "    ",
  "    for (let v = sink; v !== source; v = parent[v]) {",
  "      const u = parent[v];",
  "      graph[u][v].flow += pathFlow;",
  "      graph[v][u].flow -= pathFlow; // Residual",
  "    }",
  "    maxFlow += pathFlow;",
  "  }",
  "  return maxFlow;",
  "}"
];

export const maxFlowComplexity = {
  best: "Ω(V * E^2)",
  average: "Θ(V * E^2)",
  worst: "O(V * E^2)", 
  space: "O(V)" 
};
