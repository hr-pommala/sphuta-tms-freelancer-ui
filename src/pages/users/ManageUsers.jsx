// src/pages/Users/ManageUsers.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { listUsers, deleteUser } from "../../api/users";

export default function ManageUsers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(null);
  const [actionSel, setActionSel] = useState({}); // { [id]: "" | "edit" | "delete" }

  // Confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteUserId, setToDeleteUserId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const load = async () => {
    setLoading(true);
    setBanner(null);
    try {
      const res = await listUsers();
      // support both wrapped and unwrapped responses, but ensure rows is always an array
      const list = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setRows(Array.isArray(list) ? list : []);
      if (location.state?.flash) {
        setBanner({ type: "success", text: location.state.flash });
        // clear flash from history so it doesn't persist
        window.history.replaceState({}, document.title);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to fetch users.";
      setBanner({ type: "error", text: msg });
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Open confirm modal for deletion (instead of using window.confirm directly)
  const askDelete = (id) => {
    if (!id) {
      setBanner({ type: "error", text: "Missing user id." });
      return;
    }
    setToDeleteUserId(id);
    setConfirmOpen(true);
    // keep dropdown visually selected until action handler resets it
  };

  // Actual deletion performed when modal confirm pressed
  const confirmDelete = async () => {
    if (!toDeleteUserId) return;
    setDeleteLoading(true);
    setBanner(null);
    try {
      await deleteUser(toDeleteUserId);

      // optimistic UI update — compare as strings to avoid number/string mismatch
      setRows((rs) =>
        rs.filter((r) => {
          const rid = r?.id ?? r?.userId ?? r?.user_id;
          return String(rid) !== String(toDeleteUserId);
        })
      );

      // show banner + alert per your request
      setBanner({ type: "success", text: "User deleted successfully." });
      // requested alert message after delete
      window.alert(`${toDeleteUserId} profile deleted`);
    } catch (err) {
      const status = err?.response?.status;
      const backend = err?.response?.data?.message || err?.message || "Unknown error";
      setBanner({
        type: "error",
        text: `Failed to delete user. ${status ? `Status ${status}. ` : ""}${backend}`,
      });
      console.error("DELETE failed:", err);
      // also surface an alert on failure
      window.alert(`Delete failed: ${backend}`);
    } finally {
      setDeleteLoading(false);
      setConfirmOpen(false);
      // reset selection for the row in the dropdown UI
      setActionSel((s) => ({ ...s, [toDeleteUserId]: "" }));
      setToDeleteUserId(null);
    }
  };

  const onDelete = (id) => {
    // kept for backward compat if some code calls onDelete directly
    askDelete(id);
  };

  const handleAction = (id, action) => {
    if (!id || !action) return;
    switch (action) {
      case "edit":
        navigate(`/users/${id}/edit`);
        break;
      case "delete":
        askDelete(id);
        break;
      default:
        break;
    }
    // reset dropdown back to placeholder
    setActionSel((s) => ({ ...s, [id]: "" }));
  };

  /* Inline ConfirmModal (no external file) */
  const ConfirmModal = ({ open, title, message, onConfirm, onCancel, loading }) => {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black opacity-40" onClick={onCancel}></div>
        <div className="relative bg-white rounded shadow-lg max-w-md w-full p-6 z-50">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-gray-700 mb-4">{message}</p>
          <div className="flex justify-end gap-2">
            <button onClick={onCancel} className="px-4 py-2 border rounded" disabled={loading}>
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
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h1 className="text-2xl font-semibold">Manage Users</h1>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700" onClick={load}>
            Refresh
          </button>
          <button className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={() => navigate("/users/add")}>
            + Add User
          </button>
        </div>
      </div>

      {banner && (
        <div
          className={`mb-4 p-3 rounded ${
            banner.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {banner.text}
        </div>
      )}

      <div className="overflow-x-auto bg-white border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Full Name</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Verified</th>
              <th className="px-3 py-2">Timezone</th>
              <th className="px-3 py-2">Locale</th>
              <th className="px-3 py-2">Currency</th>
              <th className="px-3 py-2">Avatar</th>
              <th className="px-3 py-2">Active</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-3 py-3" colSpan={11}>
                  Loading...
                </td>
              </tr>
            ) : !Array.isArray(rows) || rows.length === 0 ? (
              <tr>
                <td className="px-3 py-3" colSpan={11}>
                  No users found.
                </td>
              </tr>
            ) : (
              rows.map((u, idx) => {
                const id = u?.id ?? u?.userId ?? u?.user_id ?? `row-${idx}`;
                const avatar = u?.avatarUrl ?? u?.avatar_url ?? u?.avatar ?? null;
                const currency = u?.currency ?? u?.currencyCode ?? u?.currency_code ?? "-";
                const isActive =
                  typeof u?.isActive === "boolean" ? u.isActive : u?.active ?? u?.is_active ?? true;

                return (
                  <tr key={id ?? `row-${idx}`} className="border-t">
                    <td className="px-3 py-2">{id}</td>
                    <td className="px-3 py-2">{u.fullName}</td>
                    <td className="px-3 py-2">{u.email}</td>
                    <td className="px-3 py-2 text-center">{u.status}</td>
                    <td className="px-3 py-2 text-center">{u.emailVerified ? "Yes" : "No"}</td>
                    <td className="px-3 py-2 text-center">{u.timezone}</td>
                    <td className="px-3 py-2 text-center">{u.locale}</td>
                    <td className="px-3 py-2 text-center">{currency}</td>
                    <td className="px-3 py-2 text-center">
                      {avatar ? (
                        <a href={avatar} target="_blank" rel="noreferrer" title="Open avatar">
                          <img src={avatar} alt="avatar" className="h-8 w-8 rounded object-cover mx-auto" />
                        </a>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">{isActive ? "Yes" : "No"}</td>
                    <td className="px-3 py-2 text-center">
                      <select
                        className="px-2 py-1 rounded border bg-gray-50"
                        value={actionSel[id] ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          // set visual selection and then run action
                          setActionSel((s) => ({ ...s, [id]: val }));
                          handleAction(id, val);
                        }}
                        disabled={!id || loading}
                      >
                        <option value="" disabled>
                          Select Action
                        </option>
                        <option value="edit">✏️ Edit (PUT)</option>
                        <option value="delete">🗑️ Delete</option>
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm delete modal */}
      <ConfirmModal
        open={confirmOpen}
        title="Confirm delete"
        message={`Are you sure you want to delete user with ID ${toDeleteUserId}?`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setToDeleteUserId(null);
        }}
        loading={deleteLoading}
      />
    </div>
  );
}
