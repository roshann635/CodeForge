export const heapSort = (inputArray) => {
  const steps = [];
  const arr = [...inputArray];
  const n = arr.length;
  let sorted = [];

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [...sorted],
    description: "Starting Heap Sort. First, we build a Max-Heap from the array.",
    highlightLines: [1]
  });

  const heapify = (arr, N, i) => {
    let largest = i; 
    let l = 2 * i + 1; 
    let r = 2 * i + 2; 

    if (l < N && arr[l] > arr[largest]) {
      steps.push({
        array: [...arr],
        comparing: [l, largest],
        swapping: [],
        sorted: [...sorted],
        active: i,
        description: `Left child <strong>${arr[l]}</strong> > parent <strong>${arr[largest]}</strong>.`,
        highlightLines: [10, 11]
      });
      largest = l;
    }

    if (r < N && arr[r] > arr[largest]) {
      steps.push({
        array: [...arr],
        comparing: [r, largest],
        swapping: [],
        sorted: [...sorted],
        active: i,
        description: `Right child <strong>${arr[r]}</strong> > largest <strong>${arr[largest]}</strong>.`,
        highlightLines: [13, 14]
      });
      largest = r;
    }

    if (largest !== i) {
      let swap = arr[i];
      arr[i] = arr[largest];
      arr[largest] = swap;

      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [i, largest],
        sorted: [...sorted],
        active: largest,
        description: `Swapped parent <strong>${arr[largest]}</strong> with child <strong>${arr[i]}</strong> to maintain Max-Heap property.`,
        highlightLines: [18]
      });

      heapify(arr, N, largest);
    }
  };

  // Build heap
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [...sorted],
    description: `Building Max-Heap by calling heapify on non-leaf nodes.`,
    highlightLines: [2, 3]
  });

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }

  // Extract elements
  for (let i = n - 1; i > 0; i--) {
    let temp = arr[0];
    arr[0] = arr[i];
    arr[i] = temp;

    sorted.push(i);

    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [0, i],
      sorted: [...sorted],
      description: `Moved max element <strong>${arr[i]}</strong> to end. Index ${i} is now sorted.`,
      highlightLines: [6]
    });

    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [...sorted],
      description: `Calling heapify on the reduced heap to restore Max-Heap property.`,
      highlightLines: [7]
    });
    
    heapify(arr, i, 0);
  }
  
  sorted.push(0);

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [...sorted],
    description: "Sorting complete!",
    highlightLines: [9]
  });

  return steps;
};

export const heapSortCode = [
  "function heapSort(arr) {",
  "  // Build max heap",
  "  for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {",
  "    heapify(arr, arr.length, i);",
  "  }",
  "  for (let i = arr.length - 1; i > 0; i--) {",
  "    swap(arr, 0, i); // move root to end",
  "    heapify(arr, i, 0); // heapify reduced heap",
  "  }",
  "}",
  "",
  "function heapify(arr, N, i) {",
  "  let largest = i;",
  "  let l = 2 * i + 1; let r = 2 * i + 2;",
  "  if (l < N && arr[l] > arr[largest]) largest = l;",
  "  if (r < N && arr[r] > arr[largest]) largest = r;",
  "  if (largest !== i) {",
  "    swap(arr, i, largest);",
  "    heapify(arr, N, largest);",
  "  }",
  "}"
];

export const heapSortComplexity = {
  best: "Ω(n log n)",
  average: "Θ(n log n)",
  worst: "O(n log n)",
  space: "O(1)"
};
