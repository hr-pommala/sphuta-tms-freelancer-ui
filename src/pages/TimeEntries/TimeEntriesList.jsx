// src/pages/TimeEntries/TimeEntriesList.jsx
import React, { useEffect, useState } from "react";
import { listEntries, deleteEntry } from "../../api/timesheets";

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
  const [banner, setBanner] = useState(null); // { type: 'success'|'error', text: string }

  // ✅ Fetch entries from backend
  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await listEntries();
      const result = response.data;

      if (Array.isArray(result)) {
        setEntries(result);
      } else if (result && Array.isArray(result.data)) {
        setEntries(result.data);
      } else {
        setEntries([]);
      }
    } catch (err) {
      console.error("Error fetching entries:", err);
      setEntries([]);
      setBanner({ type: "error", text: "Failed to load time entries." });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load on mount + refresh when "timeEntryCreated" is dispatched
  useEffect(() => {
    fetchEntries();

    const handler = () => fetchEntries();
    window.addEventListener("timeEntryCreated", handler);

    return () => window.removeEventListener("timeEntryCreated", handler);
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

      {/* Feedback banner */}
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
                <th className="px-4 py-2 text-left">Timesheet ID</th>
                <th className="px-4 py-2 text-left">Entry Date</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Hours</th>
                <th className="px-4 py-2 text-left">Rate</th>
                <th className="px-4 py-2 text-left">Cost</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-t">
                  <td className="px-4 py-2">{entry.id}</td>
                  <td className="px-4 py-2">{entry.timesheetId}</td>
                  <td className="px-4 py-2">{entry.entryDate}</td>
                  <td className="px-4 py-2">{entry.description}</td>
                  <td className="px-4 py-2">{entry.hours}</td>
                  <td className="px-4 py-2">{entry.rateAtEntry ?? "-"}</td>
                  <td className="px-4 py-2">{entry.costAtEntry ?? "-"}</td>
                  <td className="px-4 py-2">
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

      {/* Modal */}
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
