// src/api/projectsApi.js
import api from "./axios";

/**
 * Fetch all projects.
 * Unwraps common backend shapes:
 * - [{...}, {...}]
 * - { data: [...] }
 * - { projects: [...] }
 */
async function list(params = {}) {
  const res = await api.get("/projects", { params });
  const body = res?.data;

  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.projects)) return body.projects;

  console.warn("[projectsApi] Unexpected projects payload:", body);
  return [];
}

async function get(id) {
  const res = await api.get(`/projects/${id}`);
  const body = res?.data;

  if (body?.data) return body.data;
  if (body?.project) return body.project;
  if (body?.id) return body;

  return body;
}

export default { list, get };
