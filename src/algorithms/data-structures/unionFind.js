export const unionFindSearch = (inputArray) => {
  const steps = [];
  
  // Create 5 disjoint sets
  const initialNodes = [
    { id: 0, value: '0', group: 0, x: 100, y: 150, state: 'unvisited' },
    { id: 1, value: '1', group: 1, x: 250, y: 150, state: 'unvisited' },
    { id: 2, value: '2', group: 2, x: 400, y: 150, state: 'unvisited' },
    { id: 3, value: '3', group: 3, x: 550, y: 150, state: 'unvisited' },
    { id: 4, value: '4', group: 4, x: 700, y: 150, state: 'unvisited' }
  ];

  const initialEdges = [];

  steps.push({
    nodes: JSON.parse(JSON.stringify(initialNodes)),
    edges: JSON.parse(JSON.stringify(initialEdges)),
    activeNode: -1,
    description: `Initializing Union-Find (Disjoint Set) with 5 independent elements. Every element is its own parent (rank 0).`,
    highlightLines: [2, 3]
  });

  const parent = [0, 1, 2, 3, 4];
  const rank = [0, 0, 0, 0, 0];

  let currentNodes = JSON.parse(JSON.stringify(initialNodes));
  let currentEdges = [...initialEdges];

  const find = (i) => {
    let p = i;
    while(p !== parent[p]) {
      p = parent[p];
    }
    // Simple path compression for visualizer (we won't animate every step of compression for brevity, just the result)
    parent[i] = p;
    return p;
  };

  const union = (i, j, stepNumber) => {
    const rootI = find(i);
    const rootJ = find(j);

    currentNodes[i].state = 'active';
    currentNodes[j].state = 'active';

    steps.push({
      nodes: JSON.parse(JSON.stringify(currentNodes)),
      edges: JSON.parse(JSON.stringify(currentEdges)),
      activeNode: -1,
      description: `<strong>Operation ${stepNumber}: Union(${i}, ${j})</strong>. Finding roots...`,
      highlightLines: [5, 6]
    });

    currentNodes[i].state = 'visited';
    currentNodes[j].state = 'visited';
    currentNodes[rootI].state = 'queue';
    currentNodes[rootJ].state = 'queue';

    steps.push({
      nodes: JSON.parse(JSON.stringify(currentNodes)),
      edges: JSON.parse(JSON.stringify(currentEdges)),
      activeNode: -1,
      description: `Root of ${i} is <strong>${rootI}</strong>. Root of ${j} is <strong>${rootJ}</strong>.`,
      highlightLines: [7]
    });

    if (rootI !== rootJ) {
      let newEdge = null;
      if (rank[rootI] < rank[rootJ]) {
        parent[rootI] = rootJ;
        currentNodes[rootI].group = rootJ; // visually merge group colors
        
        // update all nodes that were in group rootI to rootJ visually
        currentNodes.forEach(n => {
          if(n.group === rootI) n.group = rootJ;
        });

        newEdge = { source: rootI, target: rootJ, highlighted: true };
        steps.push({
          nodes: JSON.parse(JSON.stringify(currentNodes)),
          edges: [...JSON.parse(JSON.stringify(currentEdges)), newEdge],
          activeNode: rootJ,
          description: `Rank of ${rootI} < Rank of ${rootJ}. Making <strong>${rootJ}</strong> the parent of <strong>${rootI}</strong>.`,
          highlightLines: [9, 10]
        });
      } else if (rank[rootI] > rank[rootJ]) {
        parent[rootJ] = rootI;
        
        currentNodes.forEach(n => {
          if(n.group === rootJ) n.group = rootI;
        });

        newEdge = { source: rootJ, target: rootI, highlighted: true };
        steps.push({
          nodes: JSON.parse(JSON.stringify(currentNodes)),
          edges: [...JSON.parse(JSON.stringify(currentEdges)), newEdge],
          activeNode: rootI,
          description: `Rank of ${rootI} > Rank of ${rootJ}. Making <strong>${rootI}</strong> the parent of <strong>${rootJ}</strong>.`,
          highlightLines: [11, 12]
        });
      } else {
        parent[rootJ] = rootI;
        rank[rootI]++;

        currentNodes.forEach(n => {
          if(n.group === rootJ) n.group = rootI;
        });

        newEdge = { source: rootJ, target: rootI, highlighted: true };
        steps.push({
          nodes: JSON.parse(JSON.stringify(currentNodes)),
          edges: [...JSON.parse(JSON.stringify(currentEdges)), newEdge],
          activeNode: rootI,
          description: `Ranks are equal. Arbitrarily making <strong>${rootI}</strong> the parent of <strong>${rootJ}</strong> and incrementing its rank to ${rank[rootI]}.`,
          highlightLines: [14, 15]
        });
      }

      if(newEdge) {
        newEdge.highlighted = false;
        currentEdges.push(newEdge);
      }
    } else {
       steps.push({
        nodes: JSON.parse(JSON.stringify(currentNodes)),
        edges: JSON.parse(JSON.stringify(currentEdges)),
        activeNode: -1,
        description: `Roots are the same! ${i} and ${j} are already in the same set. Cycle detected!`,
        highlightLines: [18]
      });
    }

    // reset states
    currentNodes.forEach(n => n.state = 'unvisited');
  };

  union(0, 1, 1);
  union(2, 3, 2);
  union(1, 3, 3); // Merging the two disjoint sets
  union(0, 2, 4); // Attempting to merge already merged sets

  steps.push({
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    edges: JSON.parse(JSON.stringify(currentEdges)),
    activeNode: -1,
    description: `Union-Find simulation complete! Groups are visualized by their root connections.`,
    highlightLines: []
  });

  return steps;
};

export const unionFindCode = [
  "class UnionFind {",
  "  constructor(size) {",
  "    this.parent = Array.from({length: size}, (_, i) => i);",
  "    this.rank = new Array(size).fill(0);",
  "  }",
  "  find(i) {",
  "    if (this.parent[i] === i) return i;",
  "    return this.parent[i] = this.find(this.parent[i]);",
  "  }",
  "  union(i, j) {",
  "    let rootI = this.find(i);",
  "    let rootJ = this.find(j);",
  "    if (rootI !== rootJ) {",
  "      if (this.rank[rootI] < this.rank[rootJ]) {",
  "        this.parent[rootI] = rootJ;",
  "      } else if (this.rank[rootI] > this.rank[rootJ]) {",
  "        this.parent[rootJ] = rootI;",
  "      } else {",
  "        this.parent[rootJ] = rootI;",
  "        this.rank[rootI]++;",
  "      }",
  "      return true;",
  "    }",
  "    return false;",
  "  }",
  "}"
];

export const unionFindComplexity = {
  best: "Ω(α(n))",    // Inverse Ackermann
  average: "Θ(α(n))", 
  worst: "O(α(n))",   // Practically O(1)
  space: "O(n)" 
};
