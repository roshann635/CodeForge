export const bubbleSort = (inputArray) => {
  const steps = [];
  const arr = [...inputArray];
  const n = arr.length;
  let sorted = [];

  // Initial step
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [...sorted],
    description: "Starting Bubble Sort. We will repeatedly step through the list, compare adjacent elements and swap them if they are in the wrong order.",
    highlightLines: [1]
  });

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({
        array: [...arr],
        comparing: [j, j + 1],
        swapping: [],
        sorted: [...sorted],
        description: `Comparing <strong>${arr[j]}</strong> and <strong>${arr[j+1]}</strong>.`,
        highlightLines: [3]
      });

      if (arr[j] > arr[j + 1]) {
        // Swap
        let temp = arr[j];
        arr[j] = arr[j+1];
        arr[j+1] = temp;
        swapped = true;

        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [j, j + 1],
          sorted: [...sorted],
          description: `<strong>${arr[j+1]}</strong> > <strong>${arr[j]}</strong>. Swapping them.`,
          highlightLines: [4, 5]
        });
      }
    }
    
    // The element at n-i-1 is now sorted
    sorted.push(n - i - 1);
    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [...sorted],
      description: `Pass complete. <strong>${arr[n-i-1]}</strong> is now in its correct final position.`,
      highlightLines: [8]
    });

    if (!swapped) {
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        sorted: [...Array(n).keys()],
        description: `No swaps occurred in this pass. The array is already sorted! Early exit.`,
        highlightLines: [9, 10]
      });
      return steps;
    }
  }
  
  sorted.push(0); // The first element is sorted
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

export const bubbleSortCode = [
  "function bubbleSort(arr) {",
  "  for (let i = 0; i < arr.length - 1; i++) {",
  "    for (let j = 0; j < arr.length - i - 1; j++) {",
  "      if (arr[j] > arr[j+1]) {",
  "        swap(arr, j, j+1);",
  "      }",
  "    }",
  "    // largest element bubbles up to correct position",
  "    if (noSwapsOccurred) break;",
  "  }",
  "}"
];

export const bubbleSortComplexity = {
  best: "Ω(n)",
  average: "Θ(n²)",
  worst: "O(n²)",
  space: "O(1)"
};
