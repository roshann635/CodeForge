export const dijkstraSearch = (inputArray, startNode = 0) => {
  const steps = [];
  
  // Graph layout with weighted edges
  const initialNodes = [
    { id: 0, value: 'A', x: 200, y: 150, state: 'unvisited', dist: Infinity },
    { id: 1, value: 'B', x: 350, y: 80, state: 'unvisited', dist: Infinity },
    { id: 2, value: 'C', x: 350, y: 220, state: 'unvisited', dist: Infinity },
    { id: 3, value: 'D', x: 500, y: 80, state: 'unvisited', dist: Infinity },
    { id: 4, value: 'E', x: 500, y: 220, state: 'unvisited', dist: Infinity },
    { id: 5, value: 'F', x: 650, y: 150, state: 'unvisited', dist: Infinity }
  ];

  initialNodes[startNode].dist = 0;

  const edges = [
    { source: 0, target: 1, weight: 4, highlighted: false },
    { source: 0, target: 2, weight: 2, highlighted: false },
    { source: 1, target: 2, weight: 5, highlighted: false },
    { source: 1, target: 3, weight: 10, highlighted: false },
    { source: 2, target: 4, weight: 3, highlighted: false },
    { source: 4, target: 3, weight: 4, highlighted: false },
    { source: 3, target: 5, weight: 11, highlighted: false },
    { source: 4, target: 5, weight: 8, highlighted: false }
  ];

  const adjList = {
    0: [{node: 1, weight: 4}, {node: 2, weight: 2}],
    1: [{node: 0, weight: 4}, {node: 2, weight: 5}, {node: 3, weight: 10}],
    2: [{node: 0, weight: 2}, {node: 1, weight: 5}, {node: 4, weight: 3}],
    3: [{node: 1, weight: 10}, {node: 4, weight: 4}, {node: 5, weight: 11}],
    4: [{node: 2, weight: 3}, {node: 3, weight: 4}, {node: 5, weight: 8}],
    5: [{node: 3, weight: 11}, {node: 4, weight: 8}]
  };

  steps.push({
    nodes: JSON.parse(JSON.stringify(initialNodes)),
    edges: JSON.parse(JSON.stringify(edges)),
    activeNode: -1,
    description: `Starting Dijkstra's Algorithm from node <strong>${initialNodes[startNode].value}</strong>. All initial distances are Infinity. Setting start distance to 0.`,
    highlightLines: [1, 2, 3]
  });

  const visited = new Set();
  const pq = [...initialNodes.map(n => ({id: n.id, dist: n.dist}))];
  
  let currentNodes = JSON.parse(JSON.stringify(initialNodes));
  let currentEdges = JSON.parse(JSON.stringify(edges));

  while (pq.length > 0) {
    // Sort to simulate Priority Queue
    pq.sort((a, b) => a.dist - b.dist);
    
    const { id: u, dist } = pq.shift();
    
    if (dist === Infinity) break;
    if (visited.has(u)) continue;
    
    visited.add(u);
    currentNodes[u].state = 'active';

    steps.push({
      nodes: JSON.parse(JSON.stringify(currentNodes)),
      edges: JSON.parse(JSON.stringify(currentEdges)),
      activeNode: u,
      description: `Extracting min-distance node <strong>${initialNodes[u].value}</strong> (distance: ${dist}) from priority queue.`,
      highlightLines: [6, 7]
    });

    currentNodes[u].state = 'visited';

    for (let neighborInfo of adjList[u]) {
      const v = neighborInfo.node;
      const weight = neighborInfo.weight;
      
      if (!visited.has(v)) {
        let edge = currentEdges.find(e => (e.source === u && e.target === v) || (e.source === v && e.target === u));
        
        steps.push({
          nodes: JSON.parse(JSON.stringify(currentNodes)),
          edges: JSON.parse(JSON.stringify(currentEdges)),
          activeNode: u,
          description: `Checking unvisited neighbor <strong>${initialNodes[v].value}</strong> (edge weight: ${weight}).`,
          highlightLines: [9, 10]
        });

        const newDist = currentNodes[u].dist + weight;
        
        if (newDist < currentNodes[v].dist) {
          if(edge) edge.highlighted = true;
          currentNodes[v].dist = newDist;
          currentNodes[v].state = 'queue';
          
          steps.push({
            nodes: JSON.parse(JSON.stringify(currentNodes)),
            edges: JSON.parse(JSON.stringify(currentEdges)),
            activeNode: v,
            description: `Found a shorter path to <strong>${initialNodes[v].value}</strong>! Updating its distance to ${newDist}.`,
            highlightLines: [11, 12, 13]
          });
          
          // Update in PQ
          const pqIndex = pq.findIndex(item => item.id === v);
          if (pqIndex !== -1) {
            pq[pqIndex].dist = newDist;
          } else {
             pq.push({id: v, dist: newDist});
          }
        } else {
           steps.push({
            nodes: JSON.parse(JSON.stringify(currentNodes)),
            edges: JSON.parse(JSON.stringify(currentEdges)),
            activeNode: u,
            description: `Path to <strong>${initialNodes[v].value}</strong> via <strong>${initialNodes[u].value}</strong> is slower (${newDist} >= ${currentNodes[v].dist}). No update.`,
            highlightLines: [11]
          });
        }
      }
    }
  }

  steps.push({
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    edges: JSON.parse(JSON.stringify(currentEdges)),
    activeNode: -1,
    description: `Dijkstra's Algorithm complete! The shortest paths from start node have been calculated.`,
    highlightLines: []
  });

  return steps;
};

export const dijkstraCode = [
  "function dijkstra(graph, start) {",
  "  const distances = {};",
  "  const pq = new PriorityQueue();",
  "  distances[start] = 0;",
  "  pq.enqueue(start, 0);",
  "  ",
  "  while (!pq.isEmpty()) {",
  "    const { node: u } = pq.dequeue();",
  "    ",
  "    for (const { node: v, weight } of graph[u]) {",
  "      const dist = distances[u] + weight;",
  "      if (dist < (distances[v] || Infinity)) {",
  "        distances[v] = dist;",
  "        pq.enqueue(v, dist);",
  "      }",
  "    }",
  "  }",
  "  return distances;",
  "}"
];

export const dijkstraComplexity = {
  best: "Ω((V + E) log V)",
  average: "Θ((V + E) log V)",
  worst: "O((V + E) log V)", 
  space: "O(V)" 
};
