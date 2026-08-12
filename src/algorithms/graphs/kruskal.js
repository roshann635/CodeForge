class UnionFind {
  constructor(size) {
    this.parent = Array.from({length: size}, (_, i) => i);
    this.rank = new Array(size).fill(0);
  }

  find(i) {
    if (this.parent[i] === i) return i;
    return this.parent[i] = this.find(this.parent[i]);
  }

  union(i, j) {
    let rootI = this.find(i);
    let rootJ = this.find(j);
    if (rootI !== rootJ) {
      if (this.rank[rootI] < this.rank[rootJ]) {
        this.parent[rootI] = rootJ;
      } else if (this.rank[rootI] > this.rank[rootJ]) {
        this.parent[rootJ] = rootI;
      } else {
        this.parent[rootJ] = rootI;
        this.rank[rootI]++;
      }
      return true; // Union successful
    }
    return false; // Already in same set
  }
}

export const kruskalSearch = (inputArray) => {
  const steps = [];
  
  const initialNodes = [
    { id: 0, value: 'A', x: 200, y: 150, state: 'unvisited' },
    { id: 1, value: 'B', x: 350, y: 80, state: 'unvisited' },
    { id: 2, value: 'C', x: 350, y: 220, state: 'unvisited' },
    { id: 3, value: 'D', x: 500, y: 80, state: 'unvisited' },
    { id: 4, value: 'E', x: 500, y: 220, state: 'unvisited' },
    { id: 5, value: 'F', x: 650, y: 150, state: 'unvisited' }
  ];

  const edges = [
    { id: 0, source: 0, target: 1, weight: 4, highlighted: false },
    { id: 1, source: 0, target: 2, weight: 2, highlighted: false },
    { id: 2, source: 1, target: 2, weight: 5, highlighted: false },
    { id: 3, source: 1, target: 3, weight: 10, highlighted: false },
    { id: 4, source: 2, target: 4, weight: 3, highlighted: false },
    { id: 5, source: 4, target: 3, weight: 4, highlighted: false },
    { id: 6, source: 3, target: 5, weight: 11, highlighted: false },
    { id: 7, source: 4, target: 5, weight: 8, highlighted: false }
  ];

  steps.push({
    nodes: JSON.parse(JSON.stringify(initialNodes)),
    edges: JSON.parse(JSON.stringify(edges)),
    activeNode: -1,
    description: `Starting Kruskal's Algorithm. First, sort all edges in non-decreasing order of their weight.`,
    highlightLines: [2]
  });

  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
  let currentNodes = JSON.parse(JSON.stringify(initialNodes));
  let currentEdges = JSON.parse(JSON.stringify(edges));
  
  const uf = new UnionFind(initialNodes.length);

  for (let i = 0; i < sortedEdges.length; i++) {
    const edge = sortedEdges[i];
    const u = edge.source;
    const v = edge.target;

    currentNodes[u].state = 'active';
    currentNodes[v].state = 'active';

    steps.push({
      nodes: JSON.parse(JSON.stringify(currentNodes)),
      edges: JSON.parse(JSON.stringify(currentEdges)),
      activeNode: u,
      description: `Picking the smallest available edge (Weight: ${edge.weight}) connecting <strong>${initialNodes[u].value}</strong> and <strong>${initialNodes[v].value}</strong>.`,
      highlightLines: [5]
    });

    if (uf.union(u, v)) {
      currentNodes[u].state = 'visited';
      currentNodes[v].state = 'visited';
      
      const edgeIndex = currentEdges.findIndex(e => e.id === edge.id);
      currentEdges[edgeIndex].highlighted = true;

      steps.push({
        nodes: JSON.parse(JSON.stringify(currentNodes)),
        edges: JSON.parse(JSON.stringify(currentEdges)),
        activeNode: u,
        description: `Adding edge to MST. It doesn't form a cycle.`,
        highlightLines: [6, 7, 8]
      });
    } else {
      currentNodes[u].state = 'unvisited'; 
      currentNodes[v].state = 'unvisited'; 
      // Note: we can keep them 'visited' if they were already visited in MST.
      // Re-assign states from uf to reflect general processed state:
      
      initialNodes.forEach((n, idx) => {
        if(uf.parent[idx] !== idx || uf.rank[idx] > 0) currentNodes[idx].state = 'visited';
      });

      steps.push({
        nodes: JSON.parse(JSON.stringify(currentNodes)),
        edges: JSON.parse(JSON.stringify(currentEdges)),
        activeNode: u,
        description: `Discarding edge. Adding it would form a cycle in the MST.`,
        highlightLines: [10]
      });
    }
  }

  steps.push({
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    edges: JSON.parse(JSON.stringify(currentEdges)),
    activeNode: -1,
    description: `Kruskal's Algorithm complete! Minimum Spanning Tree found.`,
    highlightLines: []
  });

  return steps;
};

export const kruskalCode = [
  "function kruskal(nodes, edges) {",
  "  edges.sort((a, b) => a.weight - b.weight);",
  "  const uf = new UnionFind(nodes.length);",
  "  const mst = [];",
  "  ",
  "  for (const edge of edges) {",
  "    if (uf.union(edge.u, edge.v)) {",
  "      mst.push(edge);",
  "    }",
  "  }",
  "  return mst;",
  "}"
];

export const kruskalComplexity = {
  best: "Ω(E log E)",
  average: "Θ(E log E)",
  worst: "O(E log E)", 
  space: "O(V + E)" 
};
