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

  if (err.request && !err.response) {
    return {
      success: false,
      message:
        "Network or CORS error: browser blocked the request. Check backend CORS and server availability.",
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
    // backend wraps responses in TmsApiResponse ({ success,statusCode,message,data })
    const payload = res.data?.data ?? res.data;
    return { success: true, data: payload };
  } catch (err) {
    return parseError(err);
  }
};

export const login = async (emailOrUsername, password) => {
  try {
    const res = await api.post("/auth/login", { emailOrUsername, password });
    // backend returns a wrapped TmsApiResponse -> unwrap if present
    const wrapper = res.data;
    const payload = wrapper?.data ?? wrapper;

    if (payload?.token) {
      // store header (payload.token might already be raw token or already prefixed)
      let header;
      if (typeof payload.token === "string" && payload.token.startsWith("Bearer ")) {
        header = payload.token;
      } else {
        header = `${payload.tokenType ?? "Bearer"} ${payload.token}`;
      }
      localStorage.setItem("token", header);

      // Try to find an id in multiple possible shapes returned by backend
      const id =
        payload.id ??
        payload.userId ??
        (payload.user && (payload.user.id ?? payload.user.userId)) ??
        null;

      const user = {
        id: id,
        fullName: payload.fullName ?? (payload.user && payload.user.fullName) ?? "",
        email: payload.email ?? (payload.user && payload.user.email) ?? "",
      };

      // If no id present yet, we still store minimal user info (frontend will call /auth/me as fallback)
      localStorage.setItem("user", JSON.stringify(user));
    }

    return { success: true, data: payload };
  } catch (err) {
    return parseError(err);
  }
};

export const forgotPassword = async (email) => {
  try {
    const res = await api.post("/auth/forgot", { email });
    const wrapper = res.data;
    const message = wrapper?.message ?? (res.data && res.data.message) ?? res.data;
    return { success: true, message: message || "If email exists a reset link was sent" };
  } catch (err) {
    return parseError(err);
  }
};

export const resetPassword = async (email, newPassword, confirmPassword) => {
  try {
    const res = await api.post("/auth/reset", { email, newPassword, confirmPassword });
    const wrapper = res.data;
    const message = wrapper?.message ?? (res.data && res.data.message) ?? res.data;
    return { success: true, message: message || "Password updated" };
  } catch (err) {
    return parseError(err);
  }
};

export const getMe = async () => {
  try {
    const res = await api.get("/auth/me");
    const payload = res.data?.data ?? res.data;
    // Expecting response data to be user object or { id, fullName, email }
    return { success: true, data: payload };
  } catch (err) {
    return parseError(err);
  }
};

/** Revoke current token on backend */
export const logoutRequest = async () => {
  try {
    const res = await api.post("/auth/logout");
    const payload = res.data?.data ?? res.data;
    return { success: true, data: payload };
  } catch (err) {
    return parseError(err);
  }
};

/** Clear client-side session info */
export const logout = () => {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch (e) {
    // ignore
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
