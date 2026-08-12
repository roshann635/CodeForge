/**
 * CodeForge Dynamic Runtime Trace Engine
 * Executes algorithms deterministically on user input and emits state change trace events.
 */

export function generateArrayTrace(inputArray, algorithm) {
  const arr = [...inputArray];
  const events = []; // { type: 'COMPARE'|'SWAP'|'SET'|'HIGHLIGHT', indices: [], values: [], line: number, text: string }

  if (algorithm === "Bubble Sort") {
    let n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        // Line 5: Compare arr[j] and arr[j+1]
        events.push({
          type: "COMPARE",
          indices: [j, j + 1],
          values: [...arr],
          line: 5,
          text: `Comparing arr[${j}] (${arr[j]}) and arr[${j + 1}] (${arr[j + 1]})`,
        });

        if (arr[j] > arr[j + 1]) {
          // Line 6: Swap
          let temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;

          events.push({
            type: "SWAP",
            indices: [j, j + 1],
            values: [...arr],
            line: 6,
            text: `Swapping arr[${j}] and arr[${j + 1}] -> [${arr.join(", ")}]`,
          });
        }
      }
      events.push({
        type: "SORTED_ELEMENT",
        indices: [n - i - 1],
        values: [...arr],
        line: 9,
        text: `Element at index ${n - i - 1} (${arr[n - i - 1]}) is now in final sorted position.`,
      });
    }
  } else if (algorithm === "Selection Sort") {
    let n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      events.push({
        type: "HIGHLIGHT",
        indices: [i],
        values: [...arr],
        line: 3,
        text: `Assume min index is ${i} (${arr[i]})`,
      });

      for (let j = i + 1; j < n; j++) {
        events.push({
          type: "COMPARE",
          indices: [j, minIdx],
          values: [...arr],
          line: 5,
          text: `Comparing arr[${j}] (${arr[j]}) with min (${arr[minIdx]})`,
        });

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          events.push({
            type: "NEW_MIN",
            indices: [minIdx],
            values: [...arr],
            line: 6,
            text: `Found new min element ${arr[minIdx]} at index ${minIdx}`,
          });
        }
      }

      if (minIdx !== i) {
        let temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;
        events.push({
          type: "SWAP",
          indices: [i, minIdx],
          values: [...arr],
          line: 9,
          text: `Swapped min arr[${minIdx}] to position ${i}`,
        });
      }
    }
  } else if (algorithm === "Binary Search") {
    // Target defaults to arr[Math.floor(arr.length/2)] or 8
    const sorted = [...arr].sort((a, b) => a - b);
    const target = sorted[Math.floor(sorted.length / 2)] || 8;
    let low = 0;
    let high = sorted.length - 1;

    events.push({
      type: "INIT",
      indices: [],
      values: [...sorted],
      line: 1,
      text: `Array sorted for Binary Search: [${sorted.join(", ")}]. Target = ${target}`,
    });

    while (low <= high) {
      let mid = Math.floor((low + high) / 2);
      events.push({
        type: "COMPARE",
        indices: [mid],
        range: [low, high],
        values: [...sorted],
        line: 4,
        text: `Checking mid index ${mid} (value ${sorted[mid]}). Search range [${low}..${high}]`,
      });

      if (sorted[mid] === target) {
        events.push({
          type: "FOUND",
          indices: [mid],
          values: [...sorted],
          line: 6,
          text: `🎯 Target ${target} FOUND at index ${mid}!`,
        });
        break;
      } else if (sorted[mid] < target) {
        events.push({
          type: "MOVE_RIGHT",
          indices: [mid],
          values: [...sorted],
          line: 8,
          text: `${sorted[mid]} < ${target}. Move low pointer to ${mid + 1}`,
        });
        low = mid + 1;
      } else {
        events.push({
          type: "MOVE_LEFT",
          indices: [mid],
          values: [...sorted],
          line: 10,
          text: `${sorted[mid]} > ${target}. Move high pointer to ${mid - 1}`,
        });
        high = mid - 1;
      }
    }
  }

  return { finalArray: arr, events };
}
