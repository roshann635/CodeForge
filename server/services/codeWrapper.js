/**
 * Wraps student source code for Judge0 execution.
 * Embeds test input as function arguments for JS/Python/Java/C++.
 */

function formatArgs(testInput) {
  if (!testInput) return "";
  if (testInput.startsWith("[") && testInput.includes("], ")) {
    return testInput
      .split("], ")
      .map((s, i) => (i === 0 ? s + "]" : s))
      .join(", ");
  }
  return testInput;
}

function toJavaArrayLiteral(arrayStr) {
  const inner = arrayStr.replace(/^\[|\]$/g, "").trim();
  if (!inner) return "new int[]{}";
  return `new int[]{${inner}}`;
}

function parseJavaArgs(testInput) {
  const trimmed = testInput.trim();
  if (trimmed.startsWith("[") && trimmed.includes("], ")) {
    const [arrPart, rest] = trimmed.split("], ");
    return `${toJavaArrayLiteral(arrPart + "]")}, ${rest.trim()}`;
  }
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return toJavaArrayLiteral(trimmed);
  }
  if (trimmed.startsWith('"') || trimmed.startsWith("'")) {
    return `"${trimmed.slice(1, -1)}"`;
  }
  return trimmed;
}

function toCppVector(arrayStr) {
  const inner = arrayStr.replace(/^\[|\]$/g, "").trim();
  if (!inner) return "vector<int>{}";
  return `vector<int>{${inner}}`;
}

function parseCppArgs(testInput) {
  const trimmed = testInput.trim();
  if (trimmed.startsWith("[") && trimmed.includes("], ")) {
    const [arrPart, rest] = trimmed.split("], ");
    return `${toCppVector(arrPart + "]")}, ${rest.trim()}`;
  }
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return toCppVector(trimmed);
  }
  if (trimmed.startsWith('"') || trimmed.startsWith("'")) {
    return `"${trimmed.slice(1, -1)}"`;
  }
  return trimmed;
}

function wrapCodeForExecution(sourceCode, language, funcName, testInput) {
  if (!funcName) {
    return { code: sourceCode, stdin: testInput || "" };
  }

  const args = formatArgs(testInput);

  if (language === "javascript") {
    return {
      code: `${sourceCode}\nconst __result = ${funcName}(${args});\nconsole.log(JSON.stringify(__result));`,
      stdin: "",
    };
  }

  if (language === "python") {
    const pyFunc = funcName.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`);
    return {
      code: `import json\n${sourceCode}\n__result = ${pyFunc}(${args})\nprint(json.dumps(__result))`,
      stdin: "",
    };
  }

  if (language === "java") {
    const javaArgs = parseJavaArgs(testInput);
    const driver = `
import java.util.*;
public class Main {
  public static void main(String[] args) {
    Solution sol = new Solution();
    Object result = sol.${funcName}(${javaArgs});
    if (result instanceof int[]) {
      System.out.println(Arrays.toString((int[]) result).replace(" ", ""));
    } else if (result instanceof boolean) {
      System.out.println(result.toString().toLowerCase());
    } else {
      System.out.println(result);
    }
  }
}`;
    return { code: `${sourceCode}\n${driver}`, stdin: "" };
  }

  if (language === "cpp") {
    const cppArgs = parseCppArgs(testInput);
    const includes = sourceCode.includes("#include") ? "" : "#include <bits/stdc++.h>\nusing namespace std;\n";
    const helpers = `
void __cf_print(int v) { cout << v << endl; }
void __cf_print(bool v) { cout << (v ? "true" : "false") << endl; }
void __cf_print(string v) { cout << v << endl; }
void __cf_print(vector<int> v) {
  cout << "[";
  for (size_t i = 0; i < v.size(); i++) { if (i) cout << ","; cout << v[i]; }
  cout << "]" << endl;
}`;
    const driver = `
int main() {
  Solution sol;
  __cf_print(sol.${funcName}(${cppArgs}));
  return 0;
}`;
    return { code: `${includes}${helpers}\n${sourceCode}\n${driver}`, stdin: "" };
  }

  return { code: sourceCode, stdin: testInput || "" };
}

module.exports = { wrapCodeForExecution, formatArgs };
