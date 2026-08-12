export const radixSort = (inputArray) => {
  const steps = [];
  const arr = [...inputArray];
  
  const getMax = (arr) => Math.max(...arr, 1);

  const countingSortForRadix = (arr, exp) => {
    let output = new Array(arr.length);
    let count = new Array(10).fill(0);

    for (let i = 0; i < arr.length; i++) {
        let digit = Math.floor(arr[i] / exp) % 10;
        count[digit]++;
    }

    for (let i = 1; i < 10; i++) {
        count[i] += count[i - 1];
    }

    for (let i = arr.length - 1; i >= 0; i--) {
        let digit = Math.floor(arr[i] / exp) % 10;
        output[count[digit] - 1] = arr[i];
        count[digit]--;
        
        steps.push({
            array: [...arr],
            comparing: [i],
            swapping: [],
            sorted: [],
            active: i,
            description: `Placing <strong>${arr[i]}</strong> based on digit <strong>${digit}</strong> at 10^${Math.log10(exp)} place.`,
            highlightLines: [9, 10]
        });
    }

    for (let i = 0; i < arr.length; i++) {
        arr[i] = output[i];
    }
    
    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [],
      description: `Array after sorting by the 10^${Math.log10(exp)}'s place.`,
      highlightLines: [15]
    });
  };

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    description: "Starting Radix Sort (LSD). We will sort digit by digit starting from least significant digit using Counting Sort.",
    highlightLines: [1]
  });

  const m = getMax(arr);

  for (let exp = 1; Math.floor(m / exp) > 0; exp *= 10) {
    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [],
      description: `Starting pass for the 10^${Math.log10(exp)}'s place (exp=${exp}).`,
      highlightLines: [3]
    });
    countingSortForRadix(arr, exp);
  }

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [...Array(arr.length).keys()],
    description: "Sorting complete! Every digit position has been sorted.",
    highlightLines: [6]
  });

  return steps;
};


export const radixSortCode = [
  "function radixSort(arr) {",
  "  let max = Math.max(...arr);",
  "  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {",
  "    countingSortForRadix(arr, exp);",
  "  }",
  "}",
  "",
  "function countingSortForRadix(arr, exp) {",
  "  // Performs counting sort based on digit at exp",
  "  // output[count[digit] - 1] = arr[i];",
  "  // count[digit]--;",
  "  // Copy back to arr",
  "}"
];

export const radixSortComplexity = {
  best: "Ω(nk)",
  average: "Θ(nk)",
  worst: "O(nk)",
  space: "O(n + k)"
};
