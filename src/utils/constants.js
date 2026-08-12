export const THEME_MODES = {
  DARK: 'dark',
  LIGHT: 'light'
};

export const ALGO_CATEGORIES = {
  SORTING: 'Sorting',
  ARRAYS: 'Arrays',
  LINKED_LISTS: 'Linked Lists',
  STACKS_QUEUES: 'Stacks & Queues',
  HASH_TABLES: 'Hash Tables',
  TREES: 'Trees',
  GRAPHS: 'Graphs',
  DP: 'Dynamic Programming',
  STRINGS: 'Strings'
};

export const ALGO_STATES = {
  DEFAULT: 'default',
  COMPARING: 'comparing',
  SWAPPING: 'swapping',
  SORTED: 'sorted',
  PIVOT: 'pivot',
  ACTIVE: 'active'
};

export const TRACKS = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  EXPERT: 'Expert'
};

export const ALGO_TYPES = [
  { id: 'bubble-sort', name: 'Bubble Sort', category: ALGO_CATEGORIES.SORTING },
  { id: 'selection-sort', name: 'Selection Sort', category: ALGO_CATEGORIES.SORTING },
  { id: 'insertion-sort', name: 'Insertion Sort', category: ALGO_CATEGORIES.SORTING },
  { id: 'merge-sort', name: 'Merge Sort', category: ALGO_CATEGORIES.SORTING },
  { id: 'quick-sort', name: 'Quick Sort', category: ALGO_CATEGORIES.SORTING },
  { id: 'heap-sort', name: 'Heap Sort', category: ALGO_CATEGORIES.SORTING },
  { id: 'counting-sort', name: 'Counting Sort', category: ALGO_CATEGORIES.SORTING },
  { id: 'radix-sort', name: 'Radix Sort', category: ALGO_CATEGORIES.SORTING },
  { id: 'array-search', name: 'Linear Search', category: ALGO_CATEGORIES.ARRAYS },
  { id: 'll-search', name: 'Linked List Traverse', category: ALGO_CATEGORIES.LINKED_LISTS },
  { id: 'stack-ops', name: 'Stack (LIFO)', category: ALGO_CATEGORIES.STACKS_QUEUES },
  { id: 'queue-ops', name: 'Queue (FIFO)', category: ALGO_CATEGORIES.STACKS_QUEUES },
  { id: 'hash-table', name: 'Hash Table', category: ALGO_CATEGORIES.HASH_TABLES },
  { id: 'bst-search', name: 'BST Search', category: ALGO_CATEGORIES.TREES },
  { id: 'bfs', name: 'Breadth-First Search', category: ALGO_CATEGORIES.GRAPHS }
];
