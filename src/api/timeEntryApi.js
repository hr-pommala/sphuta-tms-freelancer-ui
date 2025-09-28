import api from "./axios";

/**
 * Helper to unwrap the backend TmsApiResponse shape:
 * { status, message, data }
 */
function unwrap(response) {
  // axios response.data is the TmsApiResponse object
  return response?.data?.data ?? null;
}

/**
 * GET /api/v1/timesheets
 * Fetch all timesheets (non-paged).
 * @returns {Promise<Array>} list of timesheet DTOs
 */
export async function getAllTimesheets() {
  try {
    const res = await api.get("/timesheets");
    return unwrap(res);
  } catch (err) {
    handleAxiosError(err, "Failed to fetch timesheets");
  }
}

/**
 * POST /api/v1/timesheets
 * Create a timesheet for a project and period.
 * @param {number|string} projectId
 * @param {string} periodStart  // yyyy-MM-dd
 * @param {string} periodEnd    // yyyy-MM-dd
 * @returns {Promise<Object>} created timesheet DTO
 */
export async function createTimesheet(projectId, periodStart, periodEnd) {
  try {
    const payload = {
      projectId: Number(projectId),
      periodStart,
      periodEnd,
    };
    const res = await api.post("/timesheets", payload);
    return unwrap(res);
  } catch (err) {
    // rethrow as Error with status attached when applicable
    if (err?.response?.status) {
      const e = new Error(`Create timesheet failed (${err.response.status})`);
      e.status = err.response.status;
      e.response = err.response;
      throw e;
    }
    handleAxiosError(err, "Create timesheet failed");
  }
}

/**
 * PUT /api/v1/timesheets/{id}/entries
 * Bulk upsert time entries for a timesheet.
 * @param {number|string} timesheetId
 * @param {Array<Object>} entries  // each entry: { timesheetId, entryDate, description, hours, rateAtEntry }
 * @returns {Promise<Object>} BulkUpsertDto (server response)
 */
export async function bulkUpsertEntries(timesheetId, entries) {
  try {
    const payload = { mode: "UPSERT", entries };
    const res = await api.put(`/timesheets/${timesheetId}/entries`, payload);
    return unwrap(res);
  } catch (err) {
    handleAxiosError(err, `Bulk upsert failed for timesheet ${timesheetId}`);
  }
}

/**
 * Try to find an existing timesheet by project + period.
 * If not found, attempt to create one.
 * If create returns 409 (conflict), re-fetch timesheets and return the matching one.
 *
 * @param {number|string} projectId
 * @param {string} periodStart  // yyyy-MM-dd
 * @param {string} periodEnd    // yyyy-MM-dd
 * @returns {Promise<Object>} timesheet DTO
 */
export async function getOrCreateTimesheet(projectId, periodStart, periodEnd) {
  // 1) try to find among current timesheets
  const all = await getAllTimesheets();
  const found = (all || []).find(
    (t) =>
      Number(t.projectId) === Number(projectId) &&
      t.periodStart === periodStart &&
      t.periodEnd === periodEnd
  );
  if (found) return found;

  // 2) try create
  try {
    const created = await createTimesheet(projectId, periodStart, periodEnd);
    return created;
  } catch (err) {
    // If conflict, refresh list and return the existing one if present
    if (err?.status === 409) {
      const refreshed = await getAllTimesheets();
      const found2 = (refreshed || []).find(
        (t) =>
          Number(t.projectId) === Number(projectId) &&
          t.periodStart === periodStart &&
          t.periodEnd === periodEnd
      );
      if (found2) return found2;
    }
    // rethrow any other error
    throw err;
  }
}

/* ----------------- Utility / error handling ----------------- */

function handleAxiosError(err, fallbackMessage) {
  // axios error with response
  if (err?.response) {
    const status = err.response.status;
    const text = (err.response.data && JSON.stringify(err.response.data)) || err.response.statusText;
    const e = new Error(`${fallbackMessage}: ${status} - ${text}`);
    e.status = status;
    e.response = err.response;
    throw e;
  }

  // network or other
  throw new Error(fallbackMessage + (err?.message ? `: ${err.message}` : ""));
}

export default {
  getAllTimesheets,
  createTimesheet,
  bulkUpsertEntries,
  getOrCreateTimesheet,
  getProjects,
};

export async function getProjects() {
  try {
    const res = await api.get("/projects");
    return res?.data?.data ?? res?.data ?? [];
  } catch (err) {
    handleAxiosError(err, "Failed to fetch projects");
  }
}

