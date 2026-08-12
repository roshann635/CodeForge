import { bstSearch, bstSearchCode, bstComplexity } from './bst';
import { avlSearch, avlCode, avlComplexity } from './avl';

export const treeAlgorithms = {
  'bst-search': {
    generateSteps: bstSearch,
    code: bstSearchCode,
    complexity: bstComplexity,
    name: 'BST Search',
    componentId: 'tree'
  },
  'avl-tree': {
    generateSteps: avlSearch,
    code: avlCode,
    complexity: avlComplexity,
    name: 'AVL Tree (Rotations)',
    componentId: 'tree'
  }
};
