import api from "./axios";

// ✅ remove /api/v1, just use relative path
const BASE = "/settings/profile";

export const listProfiles   = () => api.get(BASE);
export const getProfile     = (userId) => api.get(`${BASE}/${userId}`);
export const createProfile  = (payload) => api.post(BASE, payload);
export const updateProfile  = (userId, payload) => api.put(`${BASE}/${userId}`, payload);
export const patchProfile   = (userId, payload) => api.patch(`${BASE}/${userId}`, payload);
export const deleteProfile  = (userId) => api.delete(`${BASE}/${userId}`);
