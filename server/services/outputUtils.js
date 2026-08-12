/**
 * Normalize output string for deterministic comparison
 */
function normalizeOutput(str) {
  if (!str) return "";
  return str
    .replace(/\r\n/g, "\n")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/'/g, '"')
    .replace(/True/g, "true")
    .replace(/False/g, "false")
    .replace(/None/g, "null")
    .toLowerCase();
}

module.exports = { normalizeOutput };
