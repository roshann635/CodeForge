export const linkedListSearch = (inputArray, target) => {
  const steps = [];
  const nodes = inputArray.map((val, idx) => ({ id: idx, value: val }));

  steps.push({
    nodes: [...nodes],
    headPointer: 0,
    tailPointer: nodes.length - 1,
    activeNode: -1,
    comparingNodes: [],
    foundNode: null,
    array: [], // To maintain fallback compatibility for BarChart
    description: `Starting search for <strong>${target}</strong> in the Linked List.`,
    highlightLines: [1]
  });

  let curr = 0;
  while (curr < nodes.length) {
    steps.push({
      nodes: [...nodes],
      headPointer: 0,
      tailPointer: nodes.length - 1,
      activeNode: curr,
      comparingNodes: [curr],
      foundNode: null,
      array: [],
      description: `Checking node at index ${curr} with value <strong>${nodes[curr].value}</strong>.`,
      highlightLines: [3, 4]
    });

    if (nodes[curr].value === target) {
      steps.push({
        nodes: [...nodes],
        headPointer: 0,
        tailPointer: nodes.length - 1,
        activeNode: -1,
        comparingNodes: [],
        foundNode: curr,
        array: [],
        description: `Target <strong>${target}</strong> found!`,
        highlightLines: [5]
      });
      return steps;
    }

    steps.push({
      nodes: [...nodes],
      headPointer: 0,
      tailPointer: nodes.length - 1,
      activeNode: curr,
      comparingNodes: [],
      foundNode: null,
      array: [],
      description: `Moving pointer to the next node.`,
      highlightLines: [7]
    });
    
    curr++;
  }

  steps.push({
    nodes: [...nodes],
    headPointer: 0,
    tailPointer: nodes.length - 1,
    activeNode: -1,
    comparingNodes: [],
    foundNode: null,
    array: [],
    description: `Reached the end. Target <strong>${target}</strong> not found.`,
    highlightLines: [9]
  });

  return steps;
};


export const linkedListSearchCode = [
  "function search(head, target) {",
  "  let curr = head;",
  "  while (curr !== null) {",
  "    if (curr.val === target) {",
  "      return curr;",
  "    }",
  "    curr = curr.next;",
  "  }",
  "  return null;",
  "}"
];

export const linkedListComplexity = {
  best: "Ω(1)",
  average: "Θ(n)",
  worst: "O(n)",
  space: "O(1)"
};
