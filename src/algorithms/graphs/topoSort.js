export const topoSortSearch = (inputArray) => {
  const steps = [];
  
  // DAG layout
  const initialNodes = [
    { id: 0, value: 'A', x: 150, y: 150, state: 'unvisited', inDegree: 0 },
    { id: 1, value: 'B', x: 300, y: 80, state: 'unvisited', inDegree: 1 },
    { id: 2, value: 'C', x: 300, y: 220, state: 'unvisited', inDegree: 1 },
    { id: 3, value: 'D', x: 450, y: 80, state: 'unvisited', inDegree: 2 },
    { id: 4, value: 'E', x: 450, y: 220, state: 'unvisited', inDegree: 1 },
    { id: 5, value: 'F', x: 600, y: 150, state: 'unvisited', inDegree: 2 }
  ];

  const edges = [
    { source: 0, target: 1, highlighted: false },
    { source: 0, target: 2, highlighted: false },
    { source: 1, target: 3, highlighted: false },
    { source: 2, target: 3, highlighted: false },
    { source: 2, target: 4, highlighted: false },
    { source: 3, target: 5, highlighted: false },
    { source: 4, target: 5, highlighted: false }
  ];

  const adjList = {
    0: [1, 2],
    1: [3],
    2: [3, 4],
    3: [5],
    4: [5],
    5: []
  };

  steps.push({
    nodes: JSON.parse(JSON.stringify(initialNodes)),
    edges: JSON.parse(JSON.stringify(edges)),
    activeNode: -1,
    description: `Starting Topological Sort using Kahn's Algorithm (BFS based). Calculate in-degrees for all nodes.`,
    highlightLines: [1, 2, 3]
  });

  let currentNodes = JSON.parse(JSON.stringify(initialNodes));
  let currentEdges = JSON.parse(JSON.stringify(edges));

  const queue = [];
  
  // Find nodes with 0 in-degree
  for (let i = 0; i < currentNodes.length; i++) {
    if (currentNodes[i].inDegree === 0) {
      queue.push(i);
      currentNodes[i].state = 'queue';
    }
  }

  steps.push({
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    edges: JSON.parse(JSON.stringify(currentEdges)),
    activeNode: -1,
    description: `Enqueued nodes with 0 in-degree: <strong>${queue.map(i => currentNodes[i].value).join(', ')}</strong>.`,
    highlightLines: [5, 6, 7]
  });

  const sortedOrder = [];

  while (queue.length > 0) {
    const u = queue.shift();
    currentNodes[u].state = 'active';

    steps.push({
      nodes: JSON.parse(JSON.stringify(currentNodes)),
      edges: JSON.parse(JSON.stringify(currentEdges)),
      activeNode: u,
      description: `Dequeued <strong>${currentNodes[u].value}</strong> and added it to the topological sort order.`,
      highlightLines: [9, 10, 11]
    });

    sortedOrder.push(currentNodes[u].value);
    currentNodes[u].state = 'visited'; // Marks it as processed

    for (const v of adjList[u]) {
      let edge = currentEdges.find(e => e.source === u && e.target === v);
      if(edge) edge.highlighted = true;

      currentNodes[v].inDegree -= 1;

      steps.push({
        nodes: JSON.parse(JSON.stringify(currentNodes)),
        edges: JSON.parse(JSON.stringify(currentEdges)),
        activeNode: u,
        description: `Decremented in-degree of neighbor <strong>${currentNodes[v].value}</strong>. New in-degree is ${currentNodes[v].inDegree}.`,
        highlightLines: [12, 13]
      });

      if (currentNodes[v].inDegree === 0) {
        queue.push(v);
        currentNodes[v].state = 'queue';
        
        steps.push({
          nodes: JSON.parse(JSON.stringify(currentNodes)),
          edges: JSON.parse(JSON.stringify(currentEdges)),
          activeNode: v,
          description: `Neighbor <strong>${currentNodes[v].value}</strong> now has 0 in-degree. Enqueuing it.`,
          highlightLines: [14, 15]
        });
      }
      
      if(edge) edge.highlighted = false;
    }
  }

  steps.push({
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    edges: JSON.parse(JSON.stringify(currentEdges)),
    activeNode: -1,
    description: `Topological Sort complete! Order: [${sortedOrder.join(' → ')}]`,
    highlightLines: [19]
  });

  return steps;
};

export const topoSortCode = [
  "function topologicalSort(graph, inDegree) {",
  "  const queue = [];",
  "  const order = [];",
  "  ",
  "  for (let i = 0; i < inDegree.length; i++) {",
  "    if (inDegree[i] === 0) queue.push(i);",
  "  }",
  "  ",
  "  while (queue.length > 0) {",
  "    const u = queue.shift();",
  "    order.push(u);",
  "    ",
  "    for (const v of graph[u]) {",
  "      inDegree[v]--;",
  "      if (inDegree[v] === 0) queue.push(v);",
  "    }",
  "  }",
  "  ",
  "  if (order.length !== graph.length) return null; // Cycle detected",
  "  return order;",
  "}"
];

export const topoSortComplexity = {
  best: "Ω(V + E)",
  average: "Θ(V + E)",
  worst: "O(V + E)", 
  space: "O(V)" 
};
