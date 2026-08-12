const JUDGE0_HOST = process.env.JUDGE0_HOST || "judge0-ce.p.rapidapi.com";
const JUDGE0_URL = process.env.JUDGE0_URL || (process.env.JUDGE0_API_KEY ? `https://${JUDGE0_HOST}` : "");
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || "";
const JUDGE0_AUTH_TOKEN = process.env.JUDGE0_AUTH_TOKEN || "";
const JUDGE0_AUTH_HEADER = process.env.JUDGE0_AUTH_HEADER || "X-Auth-Token";

const LANGUAGE_IDS = {
  cpp: 54,
  java: 62,
  python: 71,
  javascript: 63,
};

const TERMINAL_STATUSES = new Set([
  "ACCEPTED",
  "WRONG_ANSWER",
  "COMPILATION_ERROR",
  "RUNTIME_ERROR",
  "TIME_LIMIT_EXCEEDED",
  "MEMORY_LIMIT_EXCEEDED",
]);

function isSelfHosted() {
  return Boolean(process.env.JUDGE0_URL);
}

function isJudge0Configured() {
  return Boolean(JUDGE0_API_KEY || process.env.JUDGE0_URL);
}

function getHeaders() {
  const headers = { "Content-Type": "application/json" };

  if (JUDGE0_API_KEY) {
    // RapidAPI hosted Judge0
    headers["X-RapidAPI-Key"] = JUDGE0_API_KEY;
    headers["X-RapidAPI-Host"] = JUDGE0_HOST;
  } else if (JUDGE0_AUTH_TOKEN) {
    // Self-hosted Judge0 (AUTHN_TOKEN in judge0.conf)
    headers[JUDGE0_AUTH_HEADER] = JUDGE0_AUTH_TOKEN;
  }

  return headers;
}

/**
 * Judge0 Status IDs:
 * 3 Accepted, 4 Wrong Answer, 5 TLE, 6 CE,
 * 7-12 Runtime errors / MLE variants
 */
function parseJudge0Response(data) {
  const statusId = data.status ? data.status.id : 0;
  const statusDescription = data.status ? data.status.description : "Unknown";

  let status = "RUNTIME_ERROR";
  if (statusId === 3) status = "ACCEPTED";
  else if (statusId === 4) status = "WRONG_ANSWER";
  else if (statusId === 5) status = "TIME_LIMIT_EXCEEDED";
  else if (statusId === 6) status = "COMPILATION_ERROR";
  else if (statusId === 11 || statusId === 12) status = "MEMORY_LIMIT_EXCEEDED";
  else if (statusId >= 7 && statusId <= 12) status = "RUNTIME_ERROR";

  return {
    status,
    statusDescription,
    stdout: (data.stdout || "").trim(),
    stderr: (data.stderr || "").trim(),
    compileOutput: (data.compile_output || "").trim(),
    time: data.time ? parseFloat(data.time) * 1000 : 0,
    memory: data.memory || 0,
    token: data.token,
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollJudge0Result(token, maxAttempts = 10) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await sleep(1000);

    const response = await fetch(`${JUDGE0_URL}/submissions/${token}?base64_encoded=false`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Judge0 poll HTTP Error ${response.status}`);
    }

    const data = await response.json();
    const statusId = data.status?.id;

    if (statusId === 1 || statusId === 2) continue;

    return parseJudge0Response(data);
  }

  throw new Error("Judge0 execution timed out while polling for result");
}

async function submitViaJudge0({
  sourceCode,
  languageId,
  stdin,
  expectedOutput,
  cpuTimeLimit,
  memoryLimit,
}) {
  const useAsync = process.env.JUDGE0_ASYNC === "true";

  const body = {
    source_code: sourceCode,
    language_id: languageId,
    stdin: stdin || "",
    cpu_time_limit: cpuTimeLimit,
    memory_limit: memoryLimit,
  };

  if (expectedOutput) body.expected_output = expectedOutput;

  const query = useAsync ? "base64_encoded=false" : "base64_encoded=false&wait=true";

  const response = await fetch(`${JUDGE0_URL}/submissions?${query}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Judge0 HTTP Error ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = await response.json();

  if (useAsync && data.token) {
    return pollJudge0Result(data.token);
  }

  return parseJudge0Response(data);
}

async function submitToJudge0({
  sourceCode,
  language,
  stdin = "",
  expectedOutput = "",
  cpuTimeLimit = 2,
  memoryLimit = 128000,
}) {
  const languageId = LANGUAGE_IDS[language] || LANGUAGE_IDS.javascript;

  if (!isJudge0Configured()) {
    const hint = isSelfHosted()
      ? "Set JUDGE0_URL in server/.env (e.g. http://localhost:2358). Run: cd judge0 && ./start.sh"
      : "Set JUDGE0_URL for self-hosted OR JUDGE0_API_KEY for RapidAPI. See judge0/README.md";
    return {
      status: "RUNTIME_ERROR",
      statusDescription: "Judge0 not configured",
      stdout: "",
      stderr: hint,
      compileOutput: "",
      time: 0,
      memory: 0,
    };
  }

  try {
    return await submitViaJudge0({
      sourceCode,
      languageId,
      stdin,
      expectedOutput,
      cpuTimeLimit,
      memoryLimit,
    });
  } catch (err) {
    console.error("Judge0 submission failed:", err.message);
    return {
      status: "RUNTIME_ERROR",
      statusDescription: err.message,
      stdout: "",
      stderr: `Judge execution failed: ${err.message}`,
      compileOutput: "",
      time: 0,
      memory: 0,
    };
  }
}

/** Health check for scripts / startup */
async function checkJudge0Health() {
  if (!JUDGE0_URL) return { ok: false, error: "JUDGE0_URL not set" };
  try {
    const res = await fetch(`${JUDGE0_URL}/about`, { headers: getHeaders() });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const data = await res.json();
    return { ok: true, version: data.version, mode: isSelfHosted() ? "self-hosted" : "rapidapi" };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

module.exports = {
  submitToJudge0,
  parseJudge0Response,
  isJudge0Configured,
  isSelfHosted,
  checkJudge0Health,
  LANGUAGE_IDS,
  TERMINAL_STATUSES,
};
