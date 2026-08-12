export const quickSort = (inputArray) => {
  const steps = [];
  const arr = [...inputArray];
  let sorted = [];

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [...sorted],
    description: "Starting Quick Sort. We pick a pivot, partition the array around it, and recursively sort the sub-arrays.",
    highlightLines: [1]
  });

  const partition = (arr, low, high) => {
    let pivot = arr[high];
    
    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [...sorted],
      pivot: high,
      active: low,
      description: `Choosing <strong>${pivot}</strong> at index ${high} as the pivot.`,
      highlightLines: [8]
    });

    let i = (low - 1);

    for (let j = low; j <= high - 1; j++) {
      steps.push({
        array: [...arr],
        comparing: [j],
        swapping: [],
        sorted: [...sorted],
        pivot: high,
        active: j,
        description: `Comparing <strong>${arr[j]}</strong> with pivot <strong>${pivot}</strong>.`,
        highlightLines: [11]
      });

      if (arr[j] < pivot) {
        i++;
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
        
        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [i, j],
          sorted: [...sorted],
          pivot: high,
          active: j,
          description: `<strong>${arr[j]}</strong> < pivot. Swapping it with element at index ${i}.`,
          highlightLines: [12, 13]
        });
      }
    }

    let temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;

    sorted.push(i + 1);

    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [i + 1, high],
      sorted: [...sorted],
      pivot: i + 1,
      active: -1,
      description: `Partitioning complete. Placing pivot <strong>${pivot}</strong> in its correct sorted position at index ${i + 1}.`,
      highlightLines: [16, 17]
    });

    return (i + 1);
  };

  const quickSortRec = (arr, low, high) => {
    if (low < high) {
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        sorted: [...sorted],
        active: -1,
        description: `Processing sub-array from index ${low} to ${high}.`,
        highlightLines: [2]
      });

      let pi = partition(arr, low, high);

      quickSortRec(arr, low, pi - 1);
      quickSortRec(arr, pi + 1, high);
    } else if (low === high && low >= 0 && low < arr.length) {
      if (!sorted.includes(low)) {
        sorted.push(low);
        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [],
          sorted: [...sorted],
          active: -1,
          description: `Single element at index ${low} is inherently sorted.`,
          highlightLines: [1]
        });
      }
    }
  };

  quickSortRec(arr, 0, arr.length - 1);

  sorted = [...Array(arr.length).keys()];
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [...sorted],
    description: "Sorting complete!",
    highlightLines: [7]
  });

  return steps;
};

export const quickSortCode = [
  "function quickSort(arr, low, high) {",
  "  if (low < high) {",
  "    let pi = partition(arr, low, high);",
  "    quickSort(arr, low, pi - 1);",
  "    quickSort(arr, pi + 1, high);",
  "  }",
  "}",
  "",
  "function partition(arr, low, high) {",
  "  let pivot = arr[high];",
  "  let i = low - 1;",
  "  for (let j = low; j <= high - 1; j++) {",
  "    if (arr[j] < pivot) {",
  "      i++; swap(arr, i, j);",
  "    }",
  "  }",
  "  swap(arr, i + 1, high);",
  "  return i + 1;",
  "}"
];

export const quickSortComplexity = {
  best: "Ω(n log n)",
  average: "Θ(n log n)",
  worst: "O(n²)",
  space: "O(log n)"
};
