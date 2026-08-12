export const primSearch = (inputArray, startNode = 0) => {
  const steps = [];
  
  // Graph layout with weighted edges ( undirected )
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
    description: `Starting Prim's Algorithm from node <strong>${initialNodes[startNode].value}</strong> to find Minimum Spanning Tree (MST).`,
    highlightLines: [1, 2, 3]
  });

  const visited = new Set();
  const pq = [...initialNodes.map(n => ({id: n.id, dist: n.dist, parent: null}))];
  
  let currentNodes = JSON.parse(JSON.stringify(initialNodes));
  let currentEdges = JSON.parse(JSON.stringify(edges));

  let inMST = new Set();

  while (pq.length > 0) {
    pq.sort((a, b) => a.dist - b.dist);
    const curr = pq.shift();
    const u = curr.id;
    const dist = curr.dist;
    
    if (dist === Infinity) break;
    if (inMST.has(u)) continue;
    
    inMST.add(u);
    currentNodes[u].state = 'active';

    if (curr.parent !== null) {
      let edge = currentEdges.find(e => (e.source === u && e.target === curr.parent) || (e.source === curr.parent && e.target === u));
      if(edge) edge.highlighted = true; // permanently highlight MST edge
    }

    steps.push({
      nodes: JSON.parse(JSON.stringify(currentNodes)),
      edges: JSON.parse(JSON.stringify(currentEdges)),
      activeNode: u,
      description: `Including node <strong>${initialNodes[u].value}</strong> into MST.`,
      highlightLines: [6, 7]
    });

    currentNodes[u].state = 'visited'; // part of MST

    for (let neighborInfo of adjList[u]) {
      const v = neighborInfo.node;
      const weight = neighborInfo.weight;
      
      if (!inMST.has(v)) {
        steps.push({
          nodes: JSON.parse(JSON.stringify(currentNodes)),
          edges: JSON.parse(JSON.stringify(currentEdges)),
          activeNode: u,
          description: `Checking neighbor <strong>${initialNodes[v].value}</strong> (edge weight: ${weight}).`,
          highlightLines: [9, 10]
        });

        if (weight < currentNodes[v].dist) {
          currentNodes[v].dist = weight;
          currentNodes[v].state = 'queue';
          
          steps.push({
            nodes: JSON.parse(JSON.stringify(currentNodes)),
            edges: JSON.parse(JSON.stringify(currentEdges)),
            activeNode: v,
            description: `Edge to <strong>${initialNodes[v].value}</strong> (${weight}) is smaller than current known connection distance. Updating.`,
            highlightLines: [11, 12, 13]
          });
          
          const pqIndex = pq.findIndex(item => item.id === v);
          if (pqIndex !== -1) {
            pq[pqIndex].dist = weight;
            pq[pqIndex].parent = u;
          } else {
            pq.push({id: v, dist: weight, parent: u});
          }
        }
      }
    }
  }

  steps.push({
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    edges: JSON.parse(JSON.stringify(currentEdges)),
    activeNode: -1,
    description: `Prim's Algorithm complete! Minimum Spanning Tree found.`,
    highlightLines: []
  });

  return steps;
};

export const primCode = [
  "function prim(graph, start) {",
  "  const minCosts = {};",
  "  const pq = new PriorityQueue();",
  "  const mst = [];",
  "  pq.enqueue(start, 0);",
  "  ",
  "  while (!pq.isEmpty()) {",
  "    const { node: u, weight, parent } = pq.dequeue();",
  "    if (visited.has(u)) continue;",
  "    visited.add(u);",
  "    if (parent !== null) mst.push({ u, v: parent, weight });",
  "    ",
  "    for (const { node: v, weight: edgeWeight } of graph[u]) {",
  "      if (!visited.has(v) && edgeWeight < (minCosts[v] || Infinity)) {",
  "        minCosts[v] = edgeWeight;",
  "        pq.enqueue(v, edgeWeight, u);",
  "      }",
  "    }",
  "  }",
  "  return mst;",
  "}"
];

export const primComplexity = {
  best: "Ω(E log V)",
  average: "Θ(E log V)",
  worst: "O(E log V)", 
  space: "O(V)" 
};
