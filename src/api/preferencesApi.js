// src/api/preferencesApi.js
import axios from "./axios"; // your axiosInstance

const base = "/settings/preferences";

const preferencesApi = {
  getAll: () => axios.get(base),
  getById: (userId) => axios.get(`${base}/${userId}`),
  create: (payload) => axios.post(base, payload),
  update: (userId, payload) => axios.put(`${base}/${userId}`, payload),
  patch: (userId, payload) => axios.patch(`${base}/${userId}`, payload),
  remove: (userId) => axios.delete(`${base}/${userId}`),
};

export default preferencesApi;
