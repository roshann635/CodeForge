// API base URL — uses relative path in production, localhost in development
const API_BASE = import.meta.env.PROD
  ? ""  // In production, API is served from the same origin
  : "http://localhost:5000";

export default API_BASE;
