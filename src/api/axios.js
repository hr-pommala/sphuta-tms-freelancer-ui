// src/api/axios.js
import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE || "";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

export default api;
