// src/pages/TimeEntries/TimeEntriesList.jsx
import React, { useEffect, useState } from "react";
import { listEntries, deleteEntry } from "../../api/timesheets";
import timesheetsApi from "../../api/timesheets";

/**
 * Normalize a backend time-entry object into a consistent shape the UI expects:
 * {
 *   id, timesheetId, projectId, projectName, taskId, taskName,
 *   entryDate, hours, rateAtEntry, costAtEntry, status
 * }
 */
function parseTaskFromDescription(desc) {
  if (!desc || typeof desc !== "string") return null;
  const m = desc.match(/Task:\s*([A-Za-z0-9 _-]+)/i);
  if (m && m[1]) return m[1].trim();
  return null;
}

function normalizeEntry(raw) {
  if (!raw) return null;
  const id = raw.id ?? raw.entryId ?? raw.timeEntryId ?? null;
  const timesheetId = raw.timesheetId ?? raw.timesheet_id ?? raw.timesheet?.id ?? null;

  const projectId = raw.projectId ?? raw.project_id ?? raw.project?.id ?? null;
  const projectName = raw.projectName ?? raw.project_name ?? raw.project?.name ?? raw.project?.projectName ?? null;

  const taskId = raw.taskId ?? raw.task_id ?? raw.task?.id ?? null;
  const taskName = raw.taskName ?? raw.task_name ?? raw.task?.taskName ?? raw.task?.name ?? parseTaskFromDescription(raw.description);

  const entryDate = raw.entryDate ?? raw.entry_date ?? raw.date ?? raw.created_dt ?? raw.entry_date ?? null;
  const hours = raw.hours ?? raw.hoursWorked ?? raw.duration ?? raw.value ?? null;
  const rateAtEntry = raw.rateAtEntry ?? raw.rate_at_entry ?? raw.rate ?? null;
  const costAtEntry = raw.costAtEntry ?? raw.cost_at_entry ?? raw.cost ?? null;

  const status = raw.status ?? raw.timesheetStatus ?? raw.timesheet?.status ?? raw.entryStatus ?? "Saved";

  return {
    id,
    timesheetId,
    projectId,
    projectName,
    taskId,
    taskName,
    entryDate,
    hours,
    rateAtEntry,
    costAtEntry,
    status,
    __raw: raw,
  };
}

const ConfirmModal = ({ open, title, message, onConfirm, onCancel, loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black opacity-40"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10"
      >
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-700 mb-4">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 rounded border hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Banner = ({ message, type, onClose }) => {
  if (!message) return null;
  const bg = type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  return (
    <div className={`mb-4 p-3 rounded ${bg} flex justify-between items-start`}>
      <div>{message}</div>
      <button onClick={onClose} className="ml-4 font-semibold">✕</button>
    </div>
  );
};

const TimeEntriesList = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal / delete states
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // banner for feedback
  const [banner, setBanner] = useState(null); // { type: "success"|"error", text }

  // map timesheetId -> { projectId, projectName, status }
  const [timesheetMap, setTimesheetMap] = useState({});

  // Fetch timesheets once to map timesheetId -> projectName (so we can display both id + name)
  const loadTimesheetMap = async () => {
    try {
      const resp = await timesheetsApi.listTimesheets();
      const payload = resp?.data?.data ?? resp?.data ?? resp;
      const list = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
      const map = {};
      for (const t of list) {
        const tid = t.timesheetId ?? t.id ?? t.timesheet_id;
        if (tid == null) continue;
        map[String(tid)] = {
          projectId: t.projectId ?? t.project_id ?? t.project?.id ?? null,
          projectName: t.projectName ?? t.project_name ?? t.project?.name ?? null,
          status: t.status ?? null,
        };
      }
      setTimesheetMap(map);
    } catch (err) {
      console.warn("Failed to load timesheets for mapping project names", err);
      setTimesheetMap({});
    }
  };

  // Fetch entries from backend and normalize shapes
  const fetchEntries = async () => {
    try {
      setLoading(true);

      // load timesheet map first (so we can annotate entries)
      await loadTimesheetMap();

      const response = await listEntries();
      // the API wrapper returns axios response; be defensive
      const payload = response?.data ?? response;
      let arr = [];

      // possible shapes:
      // - { data: [...] } or { data: { data: [...] } } or plain array or { entries: [...] }
      if (payload?.data && Array.isArray(payload.data)) {
        arr = payload.data;
      } else if (Array.isArray(payload)) {
        arr = payload;
      } else if (payload?.entries && Array.isArray(payload.entries)) {
        arr = payload.entries;
      } else if (payload?.data?.entries && Array.isArray(payload.data.entries)) {
        arr = payload.data.entries;
      } else {
        // try common fallback - some APIs return { data: { data: { entries: [...] } } }
        const maybe = payload?.data ?? payload;
        if (Array.isArray(maybe)) arr = maybe;
      }

      const normalized = arr
        .map(normalizeEntry)
        .filter(Boolean)
        .map((ne) => {
          // If projectId or projectName is missing, try timesheet map by timesheetId
          if ((ne.projectId == null || ne.projectId === "") && ne.timesheetId) {
            const info = timesheetMap[String(ne.timesheetId)];
            if (info) {
              ne.projectId = ne.projectId ?? info.projectId;
              ne.projectName = ne.projectName ?? info.projectName;
              ne.status = ne.status ?? info.status;
            }
          }
          // If taskName still missing, try parse from description (some DB rows store as "Task: ...")
          if (!ne.taskName && ne.__raw && ne.__raw.description) {
            ne.taskName = parseTaskFromDescription(ne.__raw.description);
          }
          return ne;
        });

      setEntries(normalized);
    } catch (err) {
      console.error("Error fetching entries:", err);
      setEntries([]);
      setBanner({ type: "error", text: "Failed to load time entries." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
    const handler = () => fetchEntries();
    window.addEventListener("timeEntryCreated", handler);
    return () => window.removeEventListener("timeEntryCreated", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // open modal
  const openDeleteModal = (id) => {
    setDeletingId(id);
    setModalOpen(true);
    setBanner(null);
  };

  // cancel modal
  const cancelDelete = () => {
    setModalOpen(false);
    setDeletingId(null);
  };

  // confirm delete
  const confirmDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await deleteEntry(deletingId);
      setEntries((prev) => prev.filter((entry) => entry.id !== deletingId));
      setBanner({ type: "success", text: `Entry with ID ${deletingId} deleted successfully ✅` });
      setModalOpen(false);
      setDeletingId(null);
    } catch (err) {
      console.error("Error deleting entry:", err);
      setBanner({ type: "error", text: "Failed to delete entry ❌" });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Time Entries</h2>

      <Banner message={banner?.text} type={banner?.type} onClose={() => setBanner(null)} />

      {loading ? (
        <p>Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-gray-600">No entries found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Project</th>
                <th className="px-4 py-2 text-left">Task</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Hours</th>
                <th className="px-4 py-2 text-left">Rate</th>
                <th className="px-4 py-2 text-left">Cost</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id ?? Math.random()} className="border-t">
                  <td className="px-4 py-2 align-top">{entry.id}</td>

                  {/* show "projectId — projectName" when available, otherwise fallback */}
                  <td className="px-4 py-2 align-top">
                    {entry.projectId != null
                      ? entry.projectName
                        ? `${entry.projectId} — ${entry.projectName}`
                        : String(entry.projectId)
                      : entry.projectName ?? "-"}
                  </td>

                  <td className="px-4 py-2 align-top">{entry.taskName ?? entry.taskId ?? "-"}</td>
                  <td className="px-4 py-2 align-top">{entry.entryDate ?? "-"}</td>
                  <td className="px-4 py-2 align-top">{entry.hours ?? "-"}</td>
                  <td className="px-4 py-2 align-top">{entry.rateAtEntry ?? "-"}</td>
                  <td className="px-4 py-2 align-top">{entry.costAtEntry ?? "-"}</td>
                  <td className="px-4 py-2 align-top">{entry.status ?? "Saved"}</td>
                  <td className="px-4 py-2 align-top">
                    <button
                      onClick={() => openDeleteModal(entry.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={modalOpen}
        title="Confirm delete"
        message="Delete this entry? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        loading={deleteLoading}
      />
    </div>
  );
};

export default TimeEntriesList;
