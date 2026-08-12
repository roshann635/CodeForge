export const selectionSort = (inputArray) => {
  const steps = [];
  const arr = [...inputArray];
  const n = arr.length;
  let sorted = [];

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [...sorted],
    active: -1,
    description: "Starting Selection Sort. We will repeatedly find the minimum element from the unsorted part and put it at the beginning.",
    highlightLines: [1]
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    
    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [...sorted],
      active: minIdx,
      description: `Assume <strong>${arr[minIdx]}</strong> at index ${minIdx} is the minimum in the unsorted region.`,
      highlightLines: [2]
    });

    for (let j = i + 1; j < n; j++) {
      steps.push({
        array: [...arr],
        comparing: [j],
        swapping: [],
        sorted: [...sorted],
        active: minIdx,
        description: `Comparing assumed minimum <strong>${arr[minIdx]}</strong> with <strong>${arr[j]}</strong>.`,
        highlightLines: [3, 4]
      });

      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [],
          sorted: [...sorted],
          active: minIdx,
          description: `Found a new minimum: <strong>${arr[minIdx]}</strong> at index ${minIdx}.`,
          highlightLines: [5]
        });
      }
    }

    if (minIdx !== i) {
      // Swap
      let temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;

      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [i, minIdx],
        sorted: [...sorted],
        active: -1,
        description: `End of pass. Swapping minimum <strong>${arr[i]}</strong> to its correct position at index ${i}.`,
        highlightLines: [7, 8]
      });
    } else {
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        sorted: [...sorted],
        active: -1,
        description: `<strong>${arr[i]}</strong> is already the minimum in the remaining array. No swap needed.`,
        highlightLines: [7]
      });
    }

    sorted.push(i);
    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [...sorted],
      description: `Index ${i} is now sorted.`,
      highlightLines: [9]
    });
  }

  sorted.push(n - 1);
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [...sorted],
    description: "Sorting complete!",
    highlightLines: [11]
  });

  return steps;
};

export const selectionSortCode = [
  "function selectionSort(arr) {",
  "  for (let i = 0; i < arr.length - 1; i++) {",
  "    let minIdx = i;",
  "    for (let j = i + 1; j < arr.length; j++) {",
  "      if (arr[j] < arr[minIdx]) {",
  "        minIdx = j;",
  "      }",
  "    }",
  "    if (minIdx !== i) swap(arr, i, minIdx);",
  "  }",
  "}"
];

export const selectionSortComplexity = {
  best: "Ω(n²)",
  average: "Θ(n²)",
  worst: "O(n²)",
  space: "O(1)"
};
