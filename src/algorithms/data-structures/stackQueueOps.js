export const stackOps = (inputArray) => {
  const steps = [];
  let stack = [];

  steps.push({
    items: [],
    type: 'stack',
    pushingNode: null,
    poppingNode: null,
    array: [],
    description: `Starting Stack operations. Stack operates on LIFO (Last-In-First-Out).`,
    highlightLines: [1]
  });

  // Push operations
  for (let i = 0; i < Math.min(inputArray.length, 5); i++) {
    let val = inputArray[i];
    
    steps.push({
      items: [...stack],
      type: 'stack',
      pushingNode: val,
      poppingNode: null,
      array: [],
      description: `Pushing <strong>${val}</strong> onto the stack.`,
      highlightLines: [2, 3]
    });

    stack.push(val);

    steps.push({
      items: [...stack],
      type: 'stack',
      pushingNode: null,
      poppingNode: null,
      array: [],
      description: `<strong>${val}</strong> is now at the top of the stack.`,
      highlightLines: [4]
    });
  }

  // Pop operations
  for (let i = 0; i < 2; i++) {
    if (stack.length === 0) break;
    
    let top = stack[stack.length - 1];
    
    steps.push({
      items: [...stack],
      type: 'stack',
      pushingNode: null,
      poppingNode: top,
      array: [],
      description: `Popping top element <strong>${top}</strong> from the stack.`,
      highlightLines: [7]
    });

    stack.pop();

    steps.push({
      items: [...stack],
      type: 'stack',
      pushingNode: null,
      poppingNode: null,
      array: [],
      description: `Stack updated.`,
      highlightLines: [8]
    });
  }

  steps.push({
    items: [...stack],
    type: 'stack',
    pushingNode: null,
    poppingNode: null,
    array: [],
    description: `Stack operations complete.`,
    highlightLines: [10]
  });

  return steps;
};

export const stackCode = [
  "class Stack {",
  "  push(val) {",
  "    this.items.push(val);",
  "  }",
  "",
  "  pop() {",
  "    if (this.isEmpty()) return null;",
  "    return this.items.pop();",
  "  }",
  "}"
];

export const stackComplexity = {
  best: "Ω(1)",
  average: "Θ(1)",
  worst: "O(1)",
  space: "O(n)"
};

export const queueOps = (inputArray) => {
  const steps = [];
  let queue = [];

  steps.push({
    items: [],
    type: 'queue',
    pushingNode: null,
    poppingNode: null,
    array: [],
    description: `Starting Queue operations. Queue operates on FIFO (First-In-First-Out).`,
    highlightLines: [1]
  });

  // Enqueue
  for (let i = 0; i < Math.min(inputArray.length, 5); i++) {
    let val = inputArray[i];
    steps.push({
      items: [...queue],
      type: 'queue',
      pushingNode: val,
      poppingNode: null,
      array: [],
      description: `Enqueueing <strong>${val}</strong> to the rear of the queue.`,
      highlightLines: [2, 3]
    });
    queue.push(val);
    steps.push({
      items: [...queue],
      type: 'queue',
      pushingNode: null,
      poppingNode: null,
      array: [],
      description: `<strong>${val}</strong> is now at the rear.`,
      highlightLines: [4]
    });
  }

  // Dequeue
  for (let i = 0; i < 2; i++) {
    if (queue.length === 0) break;
    let front = queue[0];
    steps.push({
      items: [...queue],
      type: 'queue',
      pushingNode: null,
      poppingNode: front,
      array: [],
      description: `Dequeueing front element <strong>${front}</strong>.`,
      highlightLines: [7]
    });
    queue.shift();
    steps.push({
      items: [...queue],
      type: 'queue',
      pushingNode: null,
      poppingNode: null,
      array: [],
      description: `Queue updated.`,
      highlightLines: [8]
    });
  }

  steps.push({
    items: [...queue],
    type: 'queue',
    pushingNode: null,
    poppingNode: null,
    array: [],
    description: `Queue operations complete.`,
    highlightLines: [10]
  });

  return steps;
};

export const queueCode = [
  "class Queue {",
  "  enqueue(val) {",
  "    this.items.push(val);",
  "  }",
  "",
  "  dequeue() {",
  "    if (this.isEmpty()) return null;",
  "    return this.items.shift();",
  "  }",
  "}"
];

export const queueComplexity = {
  best: "Ω(1)",
  average: "Θ(1)",
  worst: "O(1)", // Using Array.shift is technically O(n) in JS but conceptual queue is O(1)
  space: "O(n)"
};
