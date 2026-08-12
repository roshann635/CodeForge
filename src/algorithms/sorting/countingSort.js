export const countingSort = (inputArray) => {
  const steps = [];
  const arr = [...inputArray];
  let sorted = [];

  const max = Math.max(...arr, 1);
  const min = 0; // Assuming non-negative inputs for basic counting sort
  const count = new Array(max + 1).fill(0);
  const output = new Array(arr.length).fill(0);

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    description: `Starting Counting Sort. Found max value <strong>${max}</strong>. Initializing count array of size ${max + 1}.`,
    highlightLines: [2, 3]
  });

  for (let i = 0; i < arr.length; i++) {
    count[arr[i]]++;
    steps.push({
      array: [...arr],
      comparing: [i],
      swapping: [],
      sorted: [],
      active: i,
      description: `Count array at index ${arr[i]} incremented to ${count[arr[i]]}.`,
      highlightLines: [6]
    });
  }

  for (let i = 1; i <= max; i++) {
    count[i] += count[i - 1];
  }

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    description: `Configured cumulative count array to represent actual positions in output array.`,
    highlightLines: [9, 10]
  });

  for (let i = arr.length - 1; i >= 0; i--) {
    output[count[arr[i]] - 1] = arr[i];
    count[arr[i]]--;
    
    steps.push({
      array: [...arr],
      comparing: [i],
      swapping: [],
      sorted: [],
      active: i,
      description: `Placing <strong>${arr[i]}</strong> at index ${count[arr[i]]} in the output array.`,
      highlightLines: [14, 15]
    });
  }

  for (let i = 0; i < arr.length; i++) {
    arr[i] = output[i];
    sorted.push(i);
    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [...sorted],
      description: `Copying sorted value <strong>${arr[i]}</strong> back to original array.`,
      highlightLines: [18, 19]
    });
  }

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [...sorted],
    description: "Sorting complete!",
    highlightLines: [22]
  });

  return steps;
};

export const countingSortCode = [
  "function countingSort(arr) {",
  "  let max = Math.max(...arr);",
  "  let count = new Array(max + 1).fill(0);",
  "  let output = new Array(arr.length);",
  "  ",
  "  for (let i = 0; i < arr.length; i++) count[arr[i]]++;",
  "  ",
  "  for (let i = 1; i <= max; i++) {",
  "    count[i] += count[i - 1];",
  "  }",
  "  ",
  "  for (let i = arr.length - 1; i >= 0; i--) {",
  "    output[count[arr[i]] - 1] = arr[i];",
  "    count[arr[i]]--;",
  "  }",
  "  ",
  "  for (let i = 0; i < arr.length; i++) {",
  "    arr[i] = output[i];",
  "  }",
  "}"
];

export const countingSortComplexity = {
  best: "Ω(n + k)",
  average: "Θ(n + k)",
  worst: "O(n + k)",
  space: "O(n + k)"
};
