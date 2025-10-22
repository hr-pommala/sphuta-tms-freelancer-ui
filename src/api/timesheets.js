// src/api/timesheets.js
import api from "./axios";

/**
 * Timesheets API helpers (named exports + default export object)
 *
 * Functions return the raw axios Promise (so existing callers that inspect
 * res.data or res.data.data continue to work).
 */

/* -----------------------
   Timesheet endpoints
   ----------------------- */

export async function listTimesheets() {
  return api.get("/timesheets");
}

export async function getTimesheet(timesheetId) {
  return api.get(`/timesheets/${timesheetId}`);
}

export async function createTimesheet(payload) {
  // payload example: { projectId, periodStart, periodEnd }
  return api.post("/timesheets", payload);
}

export async function updateTimesheet(timesheetId, payload) {
  return api.put(`/timesheets/${timesheetId}`, payload);
}

export async function deleteTimesheet(timesheetId) {
  return api.delete(`/timesheets/${timesheetId}`);
}

/* -----------------------
   Robust get-or-create helper
   ----------------------- */

/**
 * Try to get-or-create a timesheet for projectId + periodStart + periodEnd.
 * Strategy:
 * 1) Try to find an existing timesheet via GET /timesheets
 * 2) If not found, POST /timesheets to create
 * 3) If POST returns 409, re-check GET /timesheets and return the matching one
 *
 * Returns an axios-like resolved object (so callers that expect res.data.data keep working).
 */
export async function getOrCreateTimesheet(projectId, periodStart, periodEnd) {
  const payload = { projectId, periodStart, periodEnd };

  // 1) Try to find an existing timesheet via list
  try {
    const listResp = await listTimesheets();
    const candidate = listResp?.data?.data ?? listResp?.data ?? listResp;
    const arr = Array.isArray(candidate) ? candidate : [];
    const found = arr.find((t) => {
      const pid = (t.projectId ?? t.project_id ?? t.projectId) || null;
      const ps = (t.periodStart ?? t.period_start ?? t.periodStart) || null;
      const pe = (t.periodEnd ?? t.period_end ?? t.periodEnd) || null;
      // compare in a robust way
      return Number(pid) === Number(projectId) && String(ps) === String(periodStart) && String(pe) === String(periodEnd);
    });
    if (found) {
      // return in axios-like shape to be compatible with callers
      return { data: { data: found } };
    }
  } catch (err) {
    // ignore list failures for now and try to create
    // (we'll still attempt create below)
  }

  // 2) Try create
  try {
    const createResp = await createTimesheet(payload);
    return createResp;
  } catch (err) {
    const status = err?.response?.status;
    // 3) If conflict, try list again and return the matching timesheet
    if (status === 409) {
      try {
        const listResp2 = await listTimesheets();
        const candidate2 = listResp2?.data?.data ?? listResp2?.data ?? listResp2;
        const arr2 = Array.isArray(candidate2) ? candidate2 : [];
        const found2 = arr2.find((t) => {
          const pid = (t.projectId ?? t.project_id ?? t.projectId) || null;
          const ps = (t.periodStart ?? t.period_start ?? t.periodStart) || null;
          const pe = (t.periodEnd ?? t.period_end ?? t.periodEnd) || null;
          return Number(pid) === Number(projectId) && String(ps) === String(periodStart) && String(pe) === String(periodEnd);
        });
        if (found2) {
          return { data: { data: found2 } };
        }
      } catch (listErr) {
        // ignore and rethrow original error below
      }
    }
    // could not recover -> rethrow original error
    throw err;
  }
}

/* -----------------------
   Entries endpoints
   ----------------------- */

export async function listEntries() {
  // prefer the dedicated time-entries endpoint; fallback to legacy /entries
  try {
    return await api.get("/time-entries");
  } catch (e) {
    return api.get("/entries");
  }
}

export async function getEntry(entryId) {
  return api.get(`/time-entries/${entryId}`);
}

export async function createEntry(payload) {
  // prefer timesheet-scoped endpoint when timesheetId present
  if (payload?.timesheetId) {
    try {
      return await api.post(`/timesheets/${payload.timesheetId}/entries`, payload);
    } catch (e) {
      // fallback
    }
  }
  return api.post("/time-entries", payload);
}

export async function deleteEntry(entryId) {
  try {
    return await api.delete(`/time-entries/${entryId}`);
  } catch (e) {
    return api.delete(`/entries/${entryId}`);
  }
}

/* -----------------------
   Bulk upsert entries for a timesheet
   ----------------------- */

export async function bulkUpsert(timesheetId, payload) {
  // try PUT /timesheets/{id}/entries then fallback to POST bulk-upsert
  try {
    return await api.put(`/timesheets/${timesheetId}/entries`, payload);
  } catch (e) {
    return api.post(`/timesheets/${timesheetId}/entries/bulk-upsert`, payload);
  }
}

export async function bulkUpsertEntries(timesheetId, payload) {
  return api.post(`/timesheets/${timesheetId}/entries/bulk-upsert`, payload);
}

/* -----------------------
   Entries by timesheet id
   ----------------------- */

export async function listEntriesByTimesheet(timesheetId) {
  try {
    return await api.get(`/timesheets/${timesheetId}/entries`);
  } catch (e) {
    try {
      return await api.get(`/time-entries?timesheetId=${timesheetId}`);
    } catch (e2) {
      return api.get(`/entries?timesheetId=${timesheetId}`);
    }
  }
}

/* -----------------------
   Projects helper
   ----------------------- */

export async function getProjects(params = {}) {
  return api.get("/projects", { params });
}

/* -----------------------
   Default export object for compatibility
   ----------------------- */

const timesheetsApi = {
  // timesheets
  listTimesheets,
  getTimesheet,
  createTimesheet,
  updateTimesheet,
  deleteTimesheet,
  getOrCreateTimesheet,

  // entries
  listEntries,
  getEntry,
  createEntry,
  deleteEntry,
  listEntriesByTimesheet,

  // bulk
  bulkUpsert,
  bulkUpsertEntries,

  // projects
  getProjects,
};

export default timesheetsApi;
