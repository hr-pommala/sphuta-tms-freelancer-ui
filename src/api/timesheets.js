// src/api/timesheets.js
import api from "./axios";

export const createTimesheet = (payload) => api.post("/timesheets", payload);
export const getTimesheet = (id) => api.get(`/timesheets/${id}`);
export const listTimesheets = () => api.get("/timesheets");
export const deleteTimesheet = (id) => api.delete(`/timesheets/${id}`);
export const updateTimesheet = (id, payload) => api.put(`/timesheets/${id}`, payload); // <- new
export const bulkUpsert = (id, payload) => api.put(`/timesheets/${id}/entries`, payload);
export const submitTimesheet = (id) => api.post(`/timesheets/${id}/submit`);
export const lockTimesheet = (id) => api.patch(`/timesheets/${id}/lock`);

export const createEntry = (payload) => api.post("/time-entries", payload);
export const deleteEntry = (id) => api.delete(`/time-entries/${id}`);
export const listEntries = () => api.get("/time-entries");