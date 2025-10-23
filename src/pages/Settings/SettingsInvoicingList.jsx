import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import invoicingApi from "../../api/Settingsinvoicing";
import AlertModal from "../../components/ui/AlertModal";

export default function SettingsInvoicingList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();

  const [alertState, setAlertState] = useState({ open: false, title: "", message: "", onClose: null });

  // Confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteUserId, setToDeleteUserId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await invoicingApi.getAll();
      const payload = res?.data ?? res;
      const data = payload?.data ?? payload;
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchAll error (Settings Invoicing):", err);
      const msg = err?.response?.data?.message ?? err?.response?.data ?? err.message;
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  //
  // Delete flow: open modal on click (handleDelete), actual deletion in confirmDelete
  //
  const handleDelete = (userId) => {
    // open confirm modal instead of using window.confirm
    setToDeleteUserId(userId);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDeleteUserId) return;
    setDeleteLoading(true);

    try {
      await invoicingApi.remove(Number(toDeleteUserId));
      // remove from local state
      setItems((prev) => prev.filter(i => Number(i.userId) !== Number(toDeleteUserId)));

      // user-visible alert after successful delete (application-specific message)
      setAlertState({ open: true, title: "Deleted", message: `Settings Invoicing for user ${toDeleteUserId} deleted`, onClose: null });

    } catch (err) {
      console.error("delete error (Settings Invoicing):", err);
      const backendMsg = err?.response?.data?.message ?? err?.message ?? "Unknown error";
      setAlertState({ open: true, title: "Error", message: `Failed to delete Settings Invoicing for user ${toDeleteUserId}: ${backendMsg}`, onClose: null });
    } finally {
      setDeleteLoading(false);
      setConfirmOpen(false);
      setToDeleteUserId(null);
    }
  };

  const filtered = Array.isArray(items) ? items.filter(i =>
    !filter ||
    String(i.userId).toLowerCase().includes(filter.toLowerCase()) ||
    (i.currency || "").toLowerCase().includes(filter.toLowerCase())
  ) : [];

  // Inline ConfirmModal component
  const ConfirmModal = ({ open, title, message, onConfirm, onCancel, loading }) => {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black opacity-40" onClick={() => { if (!loading) onCancel(); }} />
        <div className="relative bg-white rounded shadow-lg max-w-md w-full p-6 z-50">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-gray-700 mb-4">{message}</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 border rounded"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Settings Invoicing</h1>
          <p className="text-sm text-gray-500">Manage Settings Invoicing entries for users</p>
        </div>
        <div className="flex gap-2">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search by userId or currency..."
            className="border rounded px-3 py-2 w-72"
          />
          <Link to="/settings/invoicing/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            New Settings Invoicing
          </Link>
        </div>
      </div>

      {loading && <div className="text-gray-500">Loading Settings Invoicing entries...</div>}
      {error && <div className="text-red-600">Error loading Settings Invoicing: {error}</div>}

      {!loading && !error && (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-2 text-sm">User ID</th>
                <th className="px-4 py-2 text-sm">Currency</th>
                <th className="px-4 py-2 text-sm">Tax Rate</th>
                <th className="px-4 py-2 text-sm">Payment Terms (days)</th>
                <th className="px-4 py-2 text-sm">Template</th>
                <th className="px-4 py-2 text-sm">Updated At</th>
                <th className="px-4 py-2 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan="7" className="px-4 py-6 text-center text-sm text-gray-500">No Settings Invoicing records found</td></tr>
              )}

              {filtered.map(item => (
                <tr key={String(item.userId)} className="border-t">
                  <td className="px-4 py-3 text-sm">{item.userId}</td>
                  <td className="px-4 py-3 text-sm">{item.currency}</td>
                  <td className="px-4 py-3 text-sm">{String(item.defaultTaxRate ?? "")}</td>
                  <td className="px-4 py-3 text-sm">{item.paymentTermsDays}</td>
                  <td className="px-4 py-3 text-sm">{item.templateId}</td>
                  <td className="px-4 py-3 text-sm">{item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "-"}</td>
                  <td className="px-4 py-3 text-sm flex gap-2">
                    <button onClick={() => navigate(`/settings/invoicing/view/${item.userId}`)} className="text-sm px-2 py-1 border rounded">View</button>
                    <button onClick={() => navigate(`/settings/invoicing/edit/${item.userId}`)} className="text-sm px-2 py-1 bg-yellow-500 text-white rounded">Edit</button>
                    <button onClick={() => handleDelete(item.userId)} className="text-sm px-2 py-1 bg-red-600 text-white rounded">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm delete modal */}
      <ConfirmModal
        open={confirmOpen}
        title="Confirm delete - Settings Invoicing"
        message={`Are you sure you want to permanently delete Settings Invoicing for user ${toDeleteUserId}?`}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!deleteLoading) {
            setConfirmOpen(false);
            setToDeleteUserId(null);
          }
        }}
        loading={deleteLoading}
      />
      <AlertModal open={alertState.open} title={alertState.title} message={alertState.message} onClose={() => { const cb = alertState.onClose; setAlertState({ open: false, title: "", message: "", onClose: null }); if (typeof cb === 'function') cb(); }} />
    </div>
  );
}
