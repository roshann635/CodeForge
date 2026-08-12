import { bfsSearch, bfsCode, bfsComplexity } from './bfs';
import { dfsSearch, dfsCode, dfsComplexity } from './dfs';
import { dijkstraSearch, dijkstraCode, dijkstraComplexity } from './dijkstra';
import { primSearch, primCode, primComplexity } from './prim';
import { kruskalSearch, kruskalCode, kruskalComplexity } from './kruskal';
import { bellmanFordSearch, bellmanFordCode, bellmanFordComplexity } from './bellmanFord';
import { topoSortSearch, topoSortCode, topoSortComplexity } from './topoSort';
import { maxFlowSearch, maxFlowCode, maxFlowComplexity } from './maxFlow';

export const graphAlgorithms = {
  'bfs': {
    generateSteps: bfsSearch,
    code: bfsCode,
    complexity: bfsComplexity,
    name: 'Breadth-First Search (BFS)',
    componentId: 'graph'
  },
  'dfs': {
    generateSteps: dfsSearch,
    code: dfsCode,
    complexity: dfsComplexity,
    name: 'Depth-First Search (DFS)',
    componentId: 'graph'
  },
  'dijkstra': {
    generateSteps: dijkstraSearch,
    code: dijkstraCode,
    complexity: dijkstraComplexity,
    name: "Dijkstra's Shortest Path",
    componentId: 'graph'
  },
  'prim': {
    generateSteps: primSearch,
    code: primCode,
    complexity: primComplexity,
    name: "Prim's Algorithm",
    componentId: 'graph'
  },
  'kruskal': {
    generateSteps: kruskalSearch,
    code: kruskalCode,
    complexity: kruskalComplexity,
    name: "Kruskal's Algorithm",
    componentId: 'graph'
  },
  'bellmanFord': {
    generateSteps: bellmanFordSearch,
    code: bellmanFordCode,
    complexity: bellmanFordComplexity,
    name: "Bellman-Ford Algorithm",
    componentId: 'graph'
  },
  'topoSort': {
    generateSteps: topoSortSearch,
    code: topoSortCode,
    complexity: topoSortComplexity,
    name: "Topological Sort",
    componentId: 'graph'
  },
  'maxFlow': {
    generateSteps: maxFlowSearch,
    code: maxFlowCode,
    complexity: maxFlowComplexity,
    name: "Max Flow (Edmonds-Karp)",
    componentId: 'graph'
  }
};
