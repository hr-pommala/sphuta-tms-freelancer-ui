import api from "./axios";

// if backend is GET /api/v1/{id} instead of /api/v1/users/{id}
const USERS = ""; // empty, since /users is not part of the path

export const createUser = (payload) => api.post("/users", payload); // still POST /api/v1/users
export const listUsers = () => api.get("/users");                   // still GET /api/v1/users

// 👇 changed: no /users prefix
export const getUser = (id) => api.get(`/${encodeURIComponent(id)}`);
export const putUser = (id, payload) => api.put(`/${encodeURIComponent(id)}`, payload);
export const patchUser = (id, payload) => api.patch(`/${encodeURIComponent(id)}`, payload);
export const deleteUser = (id) => api.delete(`/${encodeURIComponent(id)}`);
