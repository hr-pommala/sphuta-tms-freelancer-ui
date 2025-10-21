// src/api/axios.js
import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE || "";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Ensure Authorization header is attached to every request if a token exists in localStorage.
// This is defensive so we don't rely on import-order of other modules (e.g. authApi).
api.interceptors.request.use(
  (cfg) => {
    try {
      let token = localStorage.getItem("token"); // expected format: "Bearer <token>" or raw token
      if (token) {
        // Normalize: if stored token is raw (no "Bearer " prefix), add it.
        if (!token.startsWith("Bearer ")) {
          token = `Bearer ${token}`;
        }
        cfg.headers = cfg.headers || {};
        cfg.headers.Authorization = token;
      }
    } catch (e) {
      // ignore localStorage issues
    }
    return cfg;
  },
  (err) => Promise.reject(err)
);

export default api;
