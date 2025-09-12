// src/pages/settings/SettingsProfileList.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listProfiles, deleteProfile } from "../../api/settingsProfile";

// Inline confirm modal component
const ConfirmModal = ({ open, title, message, onConfirm, onCancel, loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onCancel}></div>
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

const SettingsProfileList = () => {
  const [profiles, setProfiles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toDeleteUserId, setToDeleteUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfiles();
    // eslint-disable-next-line
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await listProfiles();
      const arr = Array.isArray(res?.data?.data) ? res.data.data : [];
      setProfiles(arr);
      setFiltered(arr);
    } catch (err) {
      console.error("Failed to fetch profiles", err);
      setProfiles([]);
      setFiltered([]);
      window.alert("Failed to load profiles");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (q) => {
    setQuery(q);
    if (!q) return setFiltered(profiles);
    const lower = q.toLowerCase();
    setFiltered(
      profiles.filter(
        (p) =>
          String(p.userId).toLowerCase().includes(lower) ||
          (p.fullName || "").toLowerCase().includes(lower) ||
          (p.phone || "").toLowerCase().includes(lower) ||
          (p.locale || "").toLowerCase().includes(lower) ||
          (p.timezone || "").toLowerCase().includes(lower)
      )
    );
  };

  const handleAskDelete = (userId) => {
    setToDeleteUserId(userId);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDeleteUserId) return;
    setDeleteLoading(true);
    try {
      await deleteProfile(toDeleteUserId);
      setProfiles((prev) => prev.filter((p) => p.userId !== toDeleteUserId));
      setFiltered((prev) => prev.filter((p) => p.userId !== toDeleteUserId));
      // ✅ success message
      window.alert(`${toDeleteUserId} profile deleted`);
    } catch (err) {
      console.error("Delete failed", err);
      window.alert("Delete failed. See console for details.");
    } finally {
      setDeleteLoading(false);
      setConfirmOpen(false);
      setToDeleteUserId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h1 className="text-2xl font-semibold">Settings Profiles</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            type="search"
            placeholder="Search by name, userId, locale..."
            className="border rounded px-3 py-2 w-full md:w-72"
          />
          <button
            onClick={() => navigate("/settings/profile/new")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 whitespace-nowrap"
          >
            New Profile
          </button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-500">No profiles found.</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm">User ID</th>
                <th className="px-4 py-2 text-left text-sm">Full Name</th>
                <th className="px-4 py-2 text-left text-sm">Phone</th>
                <th className="px-4 py-2 text-left text-sm">Timezone</th>
                <th className="px-4 py-2 text-left text-sm">Locale</th>
                <th className="px-4 py-2 text-left text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((p) => (
                <tr key={p.userId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{p.userId}</td>
                  <td className="px-4 py-3">{p.fullName}</td>
                  <td className="px-4 py-3">{p.phone || "-"}</td>
                  <td className="px-4 py-3">{p.timezone}</td>
                  <td className="px-4 py-3">{p.locale}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        to={`/settings/profile/${p.userId}`}
                        className="text-sm px-3 py-1 border rounded"
                      >
                        View
                      </Link>
                      <Link
                        to={`/settings/profile/${p.userId}/edit`}
                        className="text-sm px-3 py-1 border rounded"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleAskDelete(p.userId)}
                        className="text-sm px-3 py-1 bg-red-500 text-white rounded"
                      >
                        Delete
                      </button>
                    </div>
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
        title="Confirm delete"
        message={`Are you sure you want to delete profile for userId ${toDeleteUserId}?`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setToDeleteUserId(null);
        }}
        loading={deleteLoading}
      />
    </div>
  );
};

export default SettingsProfileList;
