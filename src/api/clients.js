// src/api/clients.js
/**
 * Lightweight Clients API wrapper
 *
 * - Uses the central axios instance: src/api/axios.js
 * - Returns raw axios promises (no automatic .then(res => res.data) so callers remain unchanged)
 * - Keeps CLIENTS const so you can switch to "" if your backend path is different
 * - Optional `config` param can be passed to individual calls if you need to add headers (e.g., Authorization)
 *
 * Example usage:
 *   import clientsApi from "../api/clients";
 *   await clientsApi.listClients({ active: true, page:0, size:200 });
 *   await clientsApi.deleteClient(123);
 *
 * If your backend requires an auth header and you don't want a global interceptor, pass it:
 *   await clientsApi.listClients({ active: true }, { headers: { Authorization: `Bearer ${token}` }});
 */

import api from "./axios";

const CLIENTS = "/clients"; // set to "" if your backend uses /api/v1/{id} (no /clients)

/** Create a new client */
export const createClient = (payload, config = {}) => api.post(`${CLIENTS}`, payload, config);

/**
 * List clients
 * opts: { active=true|false, search="", page=0, size=200 }
 * config: axios config (optional) - e.g. headers
 */
export const listClients = (opts = {}, config = {}) => {
  const {
    active = true,
    search = "",
    page = 0,
    size = 200,
  } = opts;

  return api.get(`${CLIENTS}`, {
    params: {
      active,
      search,
      page,
      size,
    },
    ...config,
  });
};

/** List all clients (active + archived) — if backend supports /clients/all (optional) */
export const listAllClients = (opts = {}, config = {}) => {
  const { search = "", page = 0, size = 200 } = opts;
  return api.get(`${CLIENTS}/all`, {
    params: { search, page, size },
    ...config,
  });
};

/** Get single client by id */
export const getClient = (id, config = {}) =>
  api.get(`${CLIENTS}/${encodeURIComponent(id)}`, { ...config });

/** Full replace / update */
export const putClient = (id, payload, config = {}) =>
  api.put(`${CLIENTS}/${encodeURIComponent(id)}`, payload, { ...config });

/** Partial update */
export const patchClient = (id, payload, config = {}) =>
  api.patch(`${CLIENTS}/${encodeURIComponent(id)}`, payload, { ...config });

/** Delete client */
export const deleteClient = (id, config = {}) =>
  api.delete(`${CLIENTS}/${encodeURIComponent(id)}`, { ...config });

/** Archive client (POST /clients/{id}/archive) */
export const archiveClient = (id, config = {}) =>
  api.post(`${CLIENTS}/${encodeURIComponent(id)}/archive`, null, { ...config });

/** Unarchive client (POST /clients/{id}/unarchive) */
export const unarchiveClient = (id, config = {}) =>
  api.post(`${CLIENTS}/${encodeURIComponent(id)}/unarchive`, null, { ...config });

/**
 * Export CSV (returns arraybuffer as responseType)
 * opts: { activeFilter = "true" | "false" | "all", search = "" }
 */
export const exportClientsCsv = (opts = {}, config = {}) => {
  const { activeFilter = "true", search = "" } = opts;
  return api.get(`${CLIENTS}/export`, {
    params: { activeFilter, search },
    responseType: "arraybuffer",
    ...config,
  });
};

/** Convenience: return res.data (callers may prefer this) */
export const fetchClientsData = (opts = {}, config = {}) =>
  listClients(opts, config).then((r) => r.data);

/** default export object for easy imports */
export default {
  createClient,
  listClients,
  listAllClients,
  getClient,
  putClient,
  patchClient,
  deleteClient,
  archiveClient,
  unarchiveClient,
  exportClientsCsv,
  fetchClientsData,
};
