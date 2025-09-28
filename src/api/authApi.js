// src/api/authApi.js
import api from "./axios";

/** Attach saved token automatically to requests */
api.interceptors.request.use(
  (cfg) => {
    try {
      const token = localStorage.getItem("token"); // stored as "Bearer <token>"
      if (token) {
        cfg.headers = cfg.headers || {};
        cfg.headers.Authorization = token;
      }
    } catch (e) {
      // ignore
    }
    return cfg;
  },
  (err) => Promise.reject(err)
);

const parseError = (err) => {
  if (!err) return { success: false, message: "Unknown error" };

  // If there's no response but a request exists, likely network or CORS preflight blocked
  if (err.request && !err.response) {
    // This is often a CORS/preflight or network failure
    return {
      success: false,
      message: "Network or CORS error: browser blocked the request. Check backend CORS and server availability.",
      raw: err.message,
    };
  }

  if (err.response?.data) {
    const d = err.response.data;
    if (typeof d === "string") return { success: false, message: d };
    if (d.message) return { success: false, message: d.message };
    return { success: false, message: JSON.stringify(d) };
  }

  return { success: false, message: err.message || "Network error" };
};

export const signup = async (form) => {
  try {
    const res = await api.post("/auth/signup", form);
    return { success: true, data: res.data };
  } catch (err) {
    return parseError(err);
  }
};

export const login = async (emailOrUsername, password) => {
  try {
    const res = await api.post("/auth/login", { emailOrUsername, password });
    const payload = res.data;
    if (payload?.token) {
      const header = `${payload.tokenType ?? "Bearer"} ${payload.token}`;
      localStorage.setItem("token", header);
      localStorage.setItem("user", JSON.stringify({ fullName: payload.fullName, email: payload.email }));
    }
    return { success: true, data: payload };
  } catch (err) {
    return parseError(err);
  }
};

export const forgotPassword = async (email) => {
  try {
    const res = await api.post("/auth/forgot", { email });
    return { success: true, message: res.data?.message || "If email exists a reset link was sent" };
  } catch (err) {
    return parseError(err);
  }
};

export const resetPassword = async (email, newPassword, confirmPassword) => {
  try {
    const res = await api.post("/auth/reset", { email, newPassword, confirmPassword });
    return { success: true, message: res.data?.message || "Password updated" };
  } catch (err) {
    return parseError(err);
  }
};

export const getMe = async () => {
  try {
    const res = await api.get("/auth/me");
    return { success: true, data: res.data };
  } catch (err) {
    return parseError(err);
  }
};

/**
 * Notify backend to revoke the current token.
 * The axios instance attaches Authorization header automatically via interceptor.
 * Returns { success: true, data } on success or the parsed error object on failure.
 */
export const logoutRequest = async () => {
  try {
    const res = await api.post("/auth/logout");
    return { success: true, data: res.data };
  } catch (err) {
    return parseError(err);
  }
};

/**
 * Clear client-side session info. This preserves the previous behavior.
 * Use this after logoutRequest (or on its own) to remove token & user from localStorage.
 */
export const logout = () => {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch (e) {
    // ignore storage errors
  }
};

export default {
  signup,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  logout,
  logoutRequest,
};
