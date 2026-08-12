export const insertionSort = (inputArray) => {
  const steps = [];
  const arr = [...inputArray];
  const n = arr.length;
  let sorted = [0]; // First element is considered sorted trivially

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [...sorted],
    pivot: -1,
    description: "Starting Insertion Sort. The first element is trivially sorted. We'll pick the next element and 'insert' it into the sorted portion.",
    highlightLines: [1]
  });

  for (let i = 1; i < n; i++) {
    let key = arr[i];
    let j = i - 1;

    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [...sorted],
      pivot: i,
      description: `Taking <strong>${key}</strong> as the key to insert into the sorted portion [0...${i-1}].`,
      highlightLines: [2, 3]
    });

    while (j >= 0 && arr[j] > key) {
      steps.push({
        array: [...arr],
        comparing: [j],
        swapping: [],
        sorted: [...sorted],
        pivot: j + 1,
        description: `<strong>${arr[j]}</strong> is greater than key <strong>${key}</strong>.`,
        highlightLines: [4, 5]
      });

      arr[j + 1] = arr[j];
      
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [j + 1, j],
        sorted: [...sorted],
        pivot: j + 1,
        description: `Sliding <strong>${arr[j+1]}</strong> one position to the right.`,
        highlightLines: [6]
      });
      
      j = j - 1;
    }

    if (j >= 0) {
      steps.push({
        array: [...arr],
        comparing: [j],
        swapping: [],
        sorted: [...sorted],
        pivot: j + 1,
        description: `<strong>${arr[j]}</strong> is less than or equal to key <strong>${key}</strong>. Stop sliding.`,
        highlightLines: [4]
      });
    }

    arr[j + 1] = key;
    sorted.push(i);

    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [...sorted],
      pivot: -1,
      description: `Inserted key <strong>${key}</strong> at index ${j + 1}.`,
      highlightLines: [8]
    });
  }

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [...sorted],
    description: "Sorting complete!",
    highlightLines: [10]
  });

  return steps;
};

export const insertionSortCode = [
  "function insertionSort(arr) {",
  "  for (let i = 1; i < arr.length; i++) {",
  "    let key = arr[i];",
  "    let j = i - 1;",
  "    while (j >= 0 && arr[j] > key) {",
  "      arr[j + 1] = arr[j];",
  "      j--;",
  "    }",
  "    arr[j + 1] = key;",
  "  }",
  "}"
];

export const insertionSortComplexity = {
  best: "Ω(n)",
  average: "Θ(n²)",
  worst: "O(n²)",
  space: "O(1)"
};
