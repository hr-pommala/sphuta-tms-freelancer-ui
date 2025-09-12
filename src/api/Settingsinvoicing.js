import api from "./axios";

function computeBase() {
  const configuredBase = api?.defaults?.baseURL || import.meta.env.VITE_API_BASE_URL || "";
  const normalized = String(configuredBase).replace(/\/+$/, "");
  const hasApiV1 = normalized.endsWith("/api/v1");
  console.info("[invoicingApi] axios.baseURL =", configuredBase, " -> using hasApiV1 =", hasApiV1);
  return hasApiV1 ? "/settings/invoicing" : "/api/v1/settings/invoicing";
}

const BASE = computeBase();

export default {
  getAll() {
    return api.get(BASE);
  },
  getByUserId(userId) {
    return api.get(`${BASE}/${encodeURIComponent(userId)}`);
  },
  create(dto) {
    return api.post(BASE, dto);
  },
  update(userId, dto) {
    return api.put(`${BASE}/${encodeURIComponent(userId)}`, dto);
  },
  patch(userId, partialDto) {
    return api.patch(`${BASE}/${encodeURIComponent(userId)}`, partialDto);
  },
  remove(userId) {
    return api.delete(`${BASE}/${encodeURIComponent(userId)}`);
  },
};

