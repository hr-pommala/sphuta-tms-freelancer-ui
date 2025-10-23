// src/pages/settings/preferenceList.jsx
import React, { useEffect, useState } from "react";
import preferencesApi from "../../api/preferencesApi";
import { useNavigate } from "react-router-dom";
import AlertModal from "../../components/ui/AlertModal";

/**
 * ConfirmModal
 * - simple, self-contained confirmation modal used only for delete confirmation here
 * - doesn't change any external behavior, just replaces window.confirm
 */
const ConfirmModal = ({ open, title, message, onConfirm, onCancel, loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
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

const PreferenceList = () => {
  const [prefs, setPrefs] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [alertState, setAlertState] = useState({ open: false, title: "", message: "", onClose: null });

  // modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteUserId, setToDeleteUserId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const normalize = (item) => {
    const rawId = item.userId ?? item.user_id ?? item.userId ?? null;
    // coerce to integer if possible, otherwise null
    const intId =
      rawId === null || rawId === undefined || rawId === ""
        ? null
        : Number.isInteger(rawId)
        ? rawId
        : Number.parseInt(rawId, 10);

    return {
      userId: Number.isNaN(intId) ? null : intId,
      dateFormat: item.dateFormat ?? item.date_format ?? "",
      weekStartsOn: item.weekStartsOn ?? item.week_starts_on ?? "",
      rounding: item.rounding ?? item.rounding ?? "",
      updatedAt: item.updatedAt ?? item.updated_at ?? null,
      ...item,
    };
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await preferencesApi.getAll();
      // console.log("preferences API response:", res?.data);
      const raw = res?.data?.data ?? res?.data ?? [];
      const normalized = Array.isArray(raw) ? raw.map(normalize) : [];
      setPrefs(normalized);
    } catch (err) {
      console.error("Failed to load preferences", err);
      // keep behavior: show alert on failure
      setAlertState({ open: true, title: "Error", message: "Failed to load preferences.", onClose: null });
      setPrefs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onEdit = (userId) => {
    const idParam = userId == null ? "" : String(userId);
    navigate(`/settings/preferences/${encodeURIComponent(idParam)}/edit`);
  };

  // called when the user clicks Delete button in the table
  const onDeleteClicked = (userId) => {
    if (userId == null) {
      setAlertState({ open: true, title: "Error", message: "Missing userId for deletion.", onClose: null });
      return;
    }
    // open modal instead of window.confirm
    setToDeleteUserId(userId);
    setConfirmOpen(true);
  };

  // confirmed delete from modal
  const confirmDelete = async () => {
    if (toDeleteUserId == null) return;
    setDeleteLoading(true);
    try {
      await preferencesApi.remove(Number(toDeleteUserId));
      // keep original behavior: show alert on success
      setAlertState({ open: true, title: "Deleted", message: "Preference deleted successfully.", onClose: null });
      setPrefs((p) => p.filter((x) => x.userId !== toDeleteUserId));
    } catch (err) {
      console.error("Delete failed", err);
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to delete preference.";
      setAlertState({ open: true, title: "Error", message: String(msg), onClose: null });
    } finally {
      setDeleteLoading(false);
      setConfirmOpen(false);
      setToDeleteUserId(null);
    }
  };

  return (
    <>
      <AlertModal open={alertState.open} title={alertState.title} message={alertState.message} onClose={() => { const cb = alertState.onClose; setAlertState({ open: false, title: "", message: "", onClose: null }); if (typeof cb === 'function') cb(); }} />

    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Preference List</h2>
        <button
          onClick={() => navigate("/settings/preferences/new")}
          className="px-3 py-1 bg-slate-700 text-white rounded"
        >
          New Preference
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : prefs.length === 0 ? (
        <div className="text-sm text-slate-500">No preferences found.</div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full divide-y bg-white">
            <thead>
              <tr className="text-left">
                <th className="px-3 py-2">User ID</th>
                <th className="px-3 py-2">Date Format</th>
                <th className="px-3 py-2">Week Starts On</th>
                <th className="px-3 py-2">Rounding</th>
                <th className="px-3 py-2">Updated At</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {prefs.map((p) => {
                const key = p.userId ?? `pref-${Math.random().toString(36).slice(2, 9)}`;
                return (
                  <tr key={key}>
                    <td className="px-3 py-2">{p.userId ?? "-"}</td>
                    <td className="px-3 py-2">{p.dateFormat || "-"}</td>
                    <td className="px-3 py-2">{p.weekStartsOn || "-"}</td>
                    <td className="px-3 py-2">{p.rounding || "-"}</td>
                    <td className="px-3 py-2">
                      {p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "-"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEdit(p.userId)}
                          className="px-2 py-1 bg-amber-500 rounded text-white text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteClicked(p.userId)}
                          className="px-2 py-1 bg-red-600 rounded text-white text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm delete modal */}
      <ConfirmModal
        open={confirmOpen}
        title="Confirm delete"
        message={`Are you sure you want to delete preference for userId ${toDeleteUserId}?`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setToDeleteUserId(null);
        }}
        loading={deleteLoading}
      />
    </div>
    </>
  );
};

export default PreferenceList;
