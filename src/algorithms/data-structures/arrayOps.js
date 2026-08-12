export const arraySearch = (inputArray, target) => {
  const steps = [];
  const arr = [...inputArray];

  steps.push({
    array: [...arr],
    comparing: [],
    sorted: [],
    active: -1,
    description: `Starting Linear Search for target <strong>${target}</strong>.`,
    highlightLines: [1]
  });

  for (let i = 0; i < arr.length; i++) {
    steps.push({
      array: [...arr],
      comparing: [i],
      sorted: [],
      active: -1,
      description: `Checking if element at index ${i} (<strong>${arr[i]}</strong>) equals <strong>${target}</strong>.`,
      highlightLines: [2]
    });

    if (arr[i] === target) {
      steps.push({
        array: [...arr],
        comparing: [],
        sorted: [i], // highlight found element in green
        active: -1,
        description: `Target <strong>${target}</strong> found at index ${i}!`,
        highlightLines: [3]
      });
      return steps;
    }
  }

  steps.push({
    array: [...arr],
    comparing: [],
    sorted: [],
    active: -1,
    description: `Target <strong>${target}</strong> not found in the array.`,
    highlightLines: [5]
  });

  return steps;
};

export const arraySearchCode = [
  "function linearSearch(arr, target) {",
  "  for (let i = 0; i < arr.length; i++) {",
  "    if (arr[i] === target) return i;",
  "  }",
  "  return -1;",
  "}"
];

export const arraySearchComplexity = {
  best: "Ω(1)",
  average: "Θ(n)",
  worst: "O(n)",
  space: "O(1)"
};
