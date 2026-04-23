// API base URL
// In production on Vercel, point to the Render backend
// In development, the Vite proxy handles /api -> localhost:5000
const API_BASE = import.meta.env.VITE_API_URL || "";

export default API_BASE;
