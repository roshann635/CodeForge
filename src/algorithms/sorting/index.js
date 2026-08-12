import { bubbleSort, bubbleSortCode, bubbleSortComplexity } from './bubbleSort';
import { selectionSort, selectionSortCode, selectionSortComplexity } from './selectionSort';
import { insertionSort, insertionSortCode, insertionSortComplexity } from './insertionSort';
import { mergeSort, mergeSortCode, mergeSortComplexity } from './mergeSort';
import { quickSort, quickSortCode, quickSortComplexity } from './quickSort';
import { heapSort, heapSortCode, heapSortComplexity } from './heapSort';
import { countingSort, countingSortCode, countingSortComplexity } from './countingSort';
import { radixSort, radixSortCode, radixSortComplexity } from './radixSort';

export const sortingAlgorithms = {
  'bubble-sort': {
    generateSteps: bubbleSort,
    code: bubbleSortCode,
    complexity: bubbleSortComplexity,
    name: 'Bubble Sort'
  },
  'selection-sort': {
    generateSteps: selectionSort,
    code: selectionSortCode,
    complexity: selectionSortComplexity,
    name: 'Selection Sort'
  },
  'insertion-sort': {
    name: 'Insertion Sort'
  },
  'merge-sort': {
    generateSteps: mergeSort,
    code: mergeSortCode,
    complexity: mergeSortComplexity,
    name: 'Merge Sort'
  },
  'quick-sort': {
    generateSteps: quickSort,
    code: quickSortCode,
    complexity: quickSortComplexity,
    name: 'Quick Sort'
  },
  'heap-sort': {
    generateSteps: heapSort,
    code: heapSortCode,
    complexity: heapSortComplexity,
    name: 'Heap Sort'
  },
  'counting-sort': {
    generateSteps: countingSort,
    code: countingSortCode,
    complexity: countingSortComplexity,
    name: 'Counting Sort'
  },
  'radix-sort': {
    generateSteps: radixSort,
    code: radixSortCode,
    complexity: radixSortComplexity,
    name: 'Radix Sort'
  }
};
