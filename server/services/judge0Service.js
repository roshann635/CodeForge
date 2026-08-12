const fetch = globalThis.fetch || require("node-fetch");

const JUDGE0_HOST = process.env.JUDGE0_HOST || "judge0-ce.p.rapidapi.com";
const JUDGE0_URL = process.env.JUDGE0_URL || `https://${JUDGE0_HOST}`;
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || "";

const LANGUAGE_IDS = {
  cpp: 54, // C++ (GCC 9.2.0)
  java: 62, // Java (OpenJDK 13.0.1)
  python: 71, // Python (3.8.1)
  javascript: 63, // JavaScript (Node.js 12.14.0)
};

/**
 * Get headers for Judge0 request
 */
function getHeaders() {
  const headers = {
    "Content-Type": "application/json",
  };
  if (JUDGE0_API_KEY) {
    headers["X-RapidAPI-Key"] = JUDGE0_API_KEY;
    headers["X-RapidAPI-Host"] = JUDGE0_HOST;
  }
  return headers;
}

/**
 * Submit code to Judge0 for execution
 */
async function submitToJudge0({
  sourceCode,
  language,
  stdin = "",
  expectedOutput = "",
  cpuTimeLimit = 2,
  memoryLimit = 128000,
}) {
  const languageId = LANGUAGE_IDS[language] || LANGUAGE_IDS.javascript;

  // If Judge0 API key is set or custom JUDGE0_URL is provided, call Judge0
  if (JUDGE0_API_KEY || process.env.JUDGE0_URL) {
    try {
      const response = await fetch(
        `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            source_code: sourceCode,
            language_id: languageId,
            stdin,
            expected_output: expectedOutput,
            cpu_time_limit: cpuTimeLimit,
            memory_limit: memoryLimit,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Judge0 HTTP Error ${response.status}`);
      }

      const data = await response.json();
      return parseJudge0Response(data);
    } catch (err) {
      console.warn(
        "Judge0 submission failed, falling back to local runner:",
        err.message,
      );
    }
  }

  // Fallback engine if Judge0 API key is not configured yet
  return executeFallback({ sourceCode, language, stdin, expectedOutput });
}

/**
 * Normalize Judge0 response status codes
 * Judge0 Status IDs:
 * 1: In Queue, 2: Processing, 3: Accepted, 4: Wrong Answer,
 * 5: Time Limit Exceeded, 6: Compilation Error, 7-12: Runtime Error/MLE
 */
function parseJudge0Response(data) {
  const statusId = data.status ? data.status.id : 0;
  const statusDescription = data.status ? data.status.description : "Unknown";

  let status = "RUNTIME_ERROR";
  if (statusId === 3) status = "ACCEPTED";
  else if (statusId === 4) status = "WRONG_ANSWER";
  else if (statusId === 5) status = "TIME_LIMIT_EXCEEDED";
  else if (statusId === 6) status = "COMPILATION_ERROR";
  else if (statusId >= 7 && statusId <= 12) status = "RUNTIME_ERROR";

  return {
    status,
    statusDescription,
    stdout: (data.stdout || "").trim(),
    stderr: (data.stderr || "").trim(),
    compileOutput: (data.compile_output || "").trim(),
    time: data.time ? parseFloat(data.time) * 1000 : 0, // convert sec to ms
    memory: data.memory || 0, // KB
    token: data.token,
  };
}

/**
 * Fallback execution for dev/offline testing when Judge0 API key is pending
 */
const PISTON_API = "https://emkc.org/api/v2/piston/execute";
const PISTON_LANGS = {
  javascript: { language: "javascript", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
  cpp: { language: "c++", version: "10.2.0" },
};

async function executeFallback({ sourceCode, language, stdin = "" }) {
  try {
    const config = PISTON_LANGS[language] || PISTON_LANGS.javascript;
    const startTime = Date.now();
    const response = await fetch(PISTON_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: config.language,
        version: config.version,
        files: [{ content: sourceCode }],
        stdin,
      }),
    });
    const elapsed = Date.now() - startTime;
    const data = await response.json();

    if (!data.run) {
      return {
        status: "RUNTIME_ERROR",
        statusDescription: data.message || "Execution Error",
        stdout: "",
        stderr: data.message || "",
        compileOutput: "",
        time: elapsed,
        memory: 0,
      };
    }

    const stdout = (data.run.stdout || "").trim();
    const stderr = (data.run.stderr || "").trim();

    if (data.run.code !== 0) {
      const isCompile =
        stderr.includes("error:") ||
        stderr.includes("SyntaxError") ||
        stderr.includes("compilation");
      return {
        status: isCompile ? "COMPILATION_ERROR" : "RUNTIME_ERROR",
        statusDescription: stderr || stdout,
        stdout,
        stderr,
        compileOutput: stderr,
        time: elapsed,
        memory: 0,
      };
    }

    return {
      status: "ACCEPTED",
      statusDescription: "Accepted",
      stdout,
      stderr,
      compileOutput: "",
      time: elapsed,
      memory: 0,
    };
  } catch (err) {
    return {
      status: "RUNTIME_ERROR",
      statusDescription: err.message,
      stdout: "",
      stderr: err.message,
      compileOutput: "",
      time: 0,
      memory: 0,
    };
  }
}

module.exports = {
  submitToJudge0,
  LANGUAGE_IDS,
};
