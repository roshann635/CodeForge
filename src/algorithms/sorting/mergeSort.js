export const mergeSort = (inputArray) => {
  const steps = [];
  const arr = [...inputArray];
  let sorted = [];

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    description: "Starting Merge Sort. Divide the unsorted list into n sublists, each containing one element, then repeatedly merge sublists.",
    highlightLines: [1]
  });

  const merge = (workingArr, l, m, r) => {
    let n1 = m - l + 1;
    let n2 = r - m;

    let L = new Array(n1);
    let R = new Array(n2);

    for (let i = 0; i < n1; i++) L[i] = workingArr[l + i];
    for (let j = 0; j < n2; j++) R[j] = workingArr[m + 1 + j];

    let i = 0, j = 0, k = l;

    steps.push({
      array: [...workingArr],
      comparing: [],
      swapping: [],
      sorted: [...sorted],
      active: k,
      description: `Merging sub-arrays: [${L.join(', ')}] and [${R.join(', ')}].`,
      highlightLines: [8]
    });

    while (i < n1 && j < n2) {
      steps.push({
        array: [...workingArr],
        comparing: [l + i, m + 1 + j],
        swapping: [],
        sorted: [...sorted],
        active: k,
        description: `Comparing <strong>${L[i]}</strong> and <strong>${R[j]}</strong>.`,
        highlightLines: [9, 10]
      });

      if (L[i] <= R[j]) {
        workingArr[k] = L[i];
        steps.push({
          array: [...workingArr],
          comparing: [],
          swapping: [k],
          sorted: [...sorted],
          active: k,
          description: `<strong>${L[i]}</strong> is smaller. Placing it at index ${k}.`,
          highlightLines: [11]
        });
        i++;
      } else {
        workingArr[k] = R[j];
        steps.push({
          array: [...workingArr],
          comparing: [],
          swapping: [k],
          sorted: [...sorted],
          active: k,
          description: `<strong>${R[j]}</strong> is smaller. Placing it at index ${k}.`,
          highlightLines: [13]
        });
        j++;
      }
      k++;
    }

    while (i < n1) {
      workingArr[k] = L[i];
      steps.push({
        array: [...workingArr],
        comparing: [],
        swapping: [k],
        sorted: [...sorted],
        active: k,
        description: `Copying remaining element <strong>${L[i]}</strong> from left sub-array.`,
        highlightLines: [17]
      });
      i++;
      k++;
    }

    while (j < n2) {
      workingArr[k] = R[j];
      steps.push({
        array: [...workingArr],
        comparing: [],
        swapping: [k],
        sorted: [...sorted],
        active: k,
        description: `Copying remaining element <strong>${R[j]}</strong> from right sub-array.`,
        highlightLines: [21]
      });
      j++;
      k++;
    }

    steps.push({
      array: [...workingArr],
      comparing: [],
      swapping: [],
      sorted: [...sorted],
      active: -1,
      description: `Sub-array from index ${l} to ${r} is now sorted.`,
      highlightLines: [25]
    });
  };

  const mergeSortRec = (workingArr, l, r) => {
    if (l >= r) return;
    
    let m = l + parseInt((r - l) / 2);
    
    steps.push({
      array: [...workingArr],
      comparing: [],
      swapping: [],
      sorted: [...sorted],
      active: m,
      description: `Dividing array from index ${l} to ${r} at midpoint ${m}.`,
      highlightLines: [3]
    });

    mergeSortRec(workingArr, l, m);
    mergeSortRec(workingArr, m + 1, r);
    merge(workingArr, l, m, r);
  };

  mergeSortRec(arr, 0, arr.length - 1);

  sorted = [...Array(arr.length).keys()];
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [...sorted],
    description: "Sorting complete!",
    highlightLines: [6]
  });

  return steps;
};

export const mergeSortCode = [
  "function mergeSort(arr, l, r) {",
  "  if (l >= r) return;",
  "  let m = Math.floor((l + r) / 2);",
  "  mergeSort(arr, l, m);",
  "  mergeSort(arr, m + 1, r);",
  "  merge(arr, l, m, r);",
  "}",
  "",
  "function merge(arr, l, m, r) {",
  "  // create temp arrays L and R",
  "  while (i < n1 && j < n2) {",
  "    if (L[i] <= R[j]) {",
  "      arr[k] = L[i]; i++;",
  "    } else {",
  "      arr[k] = R[j]; j++;",
  "    }",
  "    k++;",
  "  }",
  "  while (i < n1) {",
  "    arr[k] = L[i]; i++; k++;",
  "  }",
  "  while (j < n2) {",
  "    arr[k] = R[j]; j++; k++;",
  "  }",
  "}"
];

export const mergeSortComplexity = {
  best: "Ω(n log n)",
  average: "Θ(n log n)",
  worst: "O(n log n)",
  space: "O(n)"
};
