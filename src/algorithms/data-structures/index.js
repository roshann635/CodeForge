import { arraySearch, arraySearchCode, arraySearchComplexity } from './arrayOps';
import { linkedListSearch, linkedListSearchCode, linkedListComplexity } from './linkedListOps';
import { stackOps, stackCode, stackComplexity, queueOps, queueCode, queueComplexity } from './stackQueueOps';
import { hashTableOps, hashTableCode, hashTableComplexity } from './hashTableOps';
import { unionFindSearch, unionFindCode, unionFindComplexity } from './unionFind';

export const dataStructureAlgorithms = {
  'array-search': {
    generateSteps: arraySearch,
    code: arraySearchCode,
    complexity: arraySearchComplexity,
    name: 'Array Search',
    componentId: 'array'
  },
  'll-search': {
    generateSteps: linkedListSearch,
    code: linkedListSearchCode,
    complexity: linkedListComplexity,
    name: 'Linked List Search',
    componentId: 'linked-list'
  },
  'stack-ops': {
    generateSteps: stackOps,
    code: stackCode,
    complexity: stackComplexity,
    name: 'Stack Operations',
    componentId: 'stack-queue'
  },
  'queue-ops': {
    generateSteps: queueOps,
    code: queueCode,
    complexity: queueComplexity,
    name: 'Queue Operations',
    componentId: 'stack-queue'
  },
  'hash-table': {
    generateSteps: hashTableOps,
    code: hashTableCode,
    complexity: hashTableComplexity,
    name: 'Hash Table (Chaining)',
    componentId: 'hash-table'
  },
  'union-find': {
    generateSteps: unionFindSearch,
    code: unionFindCode,
    complexity: unionFindComplexity,
    name: 'Union-Find (Disjoint Set)',
    componentId: 'graph'
  }
};
