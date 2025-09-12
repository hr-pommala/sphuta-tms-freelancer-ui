// src/pages/Timesheets/TimesheetList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listTimesheets, deleteTimesheet } from "../../api/timesheets";

const ConfirmModal = ({ open, title, message, onConfirm, onCancel, loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black opacity-40"
        onClick={onCancel}
        aria-hidden="true"
      />
      {/* modal */}
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

const TimesheetList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [banner, setBanner] = useState(null); // { type: 'success'|'error', text }
  const navigate = useNavigate();

  const load = async () => {
    try {
      setLoading(true);
      const res = await listTimesheets();
      const data = res?.data?.data ?? res?.data ?? res;
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load timesheets", err);
      setItems([]);
      setBanner({ type: "error", text: "Failed to load timesheets." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openDeleteModal = (id) => {
    setDeletingId(id);
    setModalOpen(true);
    setBanner(null);
  };

  const cancelDelete = () => {
    setModalOpen(false);
    setDeletingId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await deleteTimesheet(deletingId);
      setBanner({ type: "success", text: "Timesheet deleted successfully." });
      setModalOpen(false);
      setDeletingId(null);
      // reload list
      await load();
    } catch (err) {
      console.error("Delete failed", err);
      const msg = err?.response?.data?.message ?? "Delete failed";
      setBanner({ type: "error", text: msg });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Timesheets</h2>
        <button
          onClick={() => navigate("/timesheets/new")}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          New Timesheet
        </button>
      </div>

      {/* Banner for success / error feedback */}
      <Banner
        message={banner?.text}
        type={banner?.type}
        onClose={() => setBanner(null)}
      />

      {loading ? (
        <div>Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-gray-600">No timesheets found.</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Timesheet ID</th>
                <th className="px-4 py-2 text-left">Project</th>
                <th className="px-4 py-2 text-left">Period Start</th>
                <th className="px-4 py-2 text-left">Period End</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Entries</th>
                <th className="px-4 py-2 text-left">Total Hours</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.timesheetId} className="border-t">
                  <td className="px-4 py-2">{t.timesheetId}</td>
                  <td className="px-4 py-2">{t.projectName ?? t.projectId}</td>
                  <td className="px-4 py-2">{t.periodStart ?? ""}</td>
                  <td className="px-4 py-2">{t.periodEnd ?? ""}</td>
                  <td className="px-4 py-2">{t.status}</td>
                  <td className="px-4 py-2">{t.entries ? t.entries.length : 0}</td>
                  <td className="px-4 py-2">{t.totalHours ?? "-"}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded"
                      onClick={() => openDeleteModal(t.timesheetId)}
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

      {/* Confirm modal */}
      <ConfirmModal
        open={modalOpen}
        title="Confirm delete"
        message="Delete this timesheet? This will remove all entries. This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={cancelDelete}
        loading={deleteLoading}
      />
    </div>
  );
};

export default TimesheetList;
