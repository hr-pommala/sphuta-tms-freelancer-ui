// src/api/tasksApi.js
import api from "./axios";

// helper: unwrap the backend TmsApiResponse if present
function unwrap(res) {
  // axios response shape: res.data is the JSON body
  // backend shape: { success: true, data: <actual payload>, ... }
  return res?.data?.data ?? res?.data;
}

const tasksApi = {
  listAll: () => api.get(`/tasks`).then(unwrap),
  listByProject: (projectId) => api.get(`/projects/${projectId}/tasks`).then(unwrap),
  get: (id) => api.get(`/tasks/${id}`).then(unwrap),
  create: (projectId, payload) => api.post(`/projects/${projectId}/tasks`, payload).then(unwrap),
  update: (id, payload) => api.put(`/tasks/${id}`, payload).then(unwrap),
  delete: (id) => api.delete(`/tasks/${id}`).then(unwrap),
};

export default tasksApi;
