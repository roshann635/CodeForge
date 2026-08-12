export const hashTableOps = (inputArray) => {
  const steps = [];
  const M = 7; // Bucket size for visualizer
  const buckets = Array.from({ length: M }, () => []);

  steps.push({
    buckets: JSON.parse(JSON.stringify(buckets)),
    hashFunction: true,
    currentKey: null,
    currentHash: null,
    collisionResolution: [],
    array: [], // To maintain fallback compatibility
    description: `Starting Hash Table operations with Separate Chaining. Table size M = ${M}.`,
    highlightLines: [1, 2]
  });

  for (let val of inputArray) {
    const hash = val % M;

    steps.push({
      buckets: JSON.parse(JSON.stringify(buckets)),
      hashFunction: true,
      currentKey: val,
      currentHash: hash,
      collisionResolution: [],
      array: [],
      description: `Computing hash for <strong>${val}</strong>. h(${val}) = ${val} mod ${M} = ${hash}.`,
      highlightLines: [5]
    });

    if (buckets[hash].length > 0) {
      steps.push({
        buckets: JSON.parse(JSON.stringify(buckets)),
        hashFunction: true,
        currentKey: val,
        currentHash: hash,
        collisionResolution: [hash],
        array: [],
        description: `Bucket ${hash} is not empty. Collision resolved via Separate Chaining (Linked List).`,
        highlightLines: [7]
      });
    }

    buckets[hash].push(val);

    steps.push({
      buckets: JSON.parse(JSON.stringify(buckets)),
      hashFunction: true,
      currentKey: val,
      currentHash: hash,
      collisionResolution: [],
      array: [],
      description: `Inserted <strong>${val}</strong> into bucket ${hash}.`,
      highlightLines: [8]
    });
  }

  steps.push({
    buckets: JSON.parse(JSON.stringify(buckets)),
    hashFunction: true,
    currentKey: null,
    currentHash: null,
    collisionResolution: [],
    array: [],
    description: `Hash Table operations complete.`,
    highlightLines: [11]
  });

  return steps;
};


export const hashTableCode = [
  "class HashTable {",
  "  constructor(size = 7) {",
  "    this.buckets = Array.from({ length: size }, () => []);",
  "  }",
  "",
  "  insert(key) {",
  "    let hash = key % this.buckets.length;",
  "    this.buckets[hash].push(key);",
  "  }",
  "}"
];

export const hashTableComplexity = {
  best: "Ω(1)",
  average: "Θ(1)",
  worst: "O(n)", // All elements hash to same bucket
  space: "O(n)"
};
