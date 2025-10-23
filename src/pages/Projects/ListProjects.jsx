import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import AlertModal from "../../components/ui/AlertModal";

function ListProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [filters, setFilters] = useState({
    active: true,
    clientId: "",
    search: "",
  });

  // Toast state (for archive/unarchive only)
  const [toast, setToast] = useState({ type: "", message: "" });
  const toastTimer = useRef(null);

  // Confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteProjectId, setToDeleteProjectId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  // alert modal state
  const [alertState, setAlertState] = useState({ open: false, title: "", message: "", onClose: null });

  const showToast = (type, message) => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }
    setToast({ type, message });
    toastTimer.current = setTimeout(
      () => setToast({ type: "", message: "" }),
      3000
    );
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  // Fetch projects
  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams({
        active: filters.active,
        page: 0,
        size: 50,
      });
      if (filters.clientId) params.append("clientId", filters.clientId);
      if (filters.search) params.append("search", filters.search);

      const res = await api.get(`/projects/projects?${params.toString()}`);
      setProjects(res.data.data?.content || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setAlertState({ open: true, title: "Error", message: "Failed to load projects.", onClose: null });
    }
  };

  // Fetch clients
  const fetchClients = async () => {
    try {
      const res = await api.get("/projects/clients?active=true&page=0&size=100");
      setClients(res.data.data?.content || []);
    } catch (err) {
      console.error("Error fetching clients:", err);
      setAlertState({ open: true, title: "Error", message: "Failed to load clients.", onClose: null });
    }
  };

  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Archive/Unarchive project (toast instead of alert)
  const handleArchive = async (id, isActive) => {
    try {
      if (isActive) {
        await api.post(`/projects/projects/${id}/archive`);
        showToast("success", `Project #${id} archived.`);
      } else {
        await api.post(`/projects/projects/${id}/unarchive`);
        showToast("success", `Project #${id} unarchived.`);
      }
      fetchProjects();
    } catch (err) {
      console.error("Error archiving/unarchiving:", err);
      showToast("error", "Action failed. Please try again.");
    }
  };

  // Ask before delete
  const confirmDelete = (id) => {
    setToDeleteProjectId(id);
    setConfirmOpen(true);
  };

  // Delete project after confirm (alert)
  const handleDelete = async () => {
    if (!toDeleteProjectId) return;
    const id = toDeleteProjectId;
    setDeleteLoading(true);
    try {
      await api.delete(`/projects/projects/${id}`);
      await fetchProjects();
      setAlertState({ open: true, title: "Deleted", message: `Project #${id} deleted.`, onClose: null });
    } catch (err) {
      console.error("Error deleting project:", err);
      setAlertState({ open: true, title: "Error", message: "Delete failed. Please try again.", onClose: null });
    } finally {
      setDeleteLoading(false);
      setConfirmOpen(false);
      setToDeleteProjectId(null);
    }
  };

  return (
    <>
      <AlertModal open={alertState.open} title={alertState.title} message={alertState.message} onClose={() => { const cb = alertState.onClose; setAlertState({ open: false, title: "", message: "", onClose: null }); if (typeof cb === 'function') cb(); }} />

      <div className="p-4 max-w-screen-xl mx-auto relative">
        {/* Toast for archive/unarchive */}
        {toast.message && (
          <div
            className={`fixed top-4 right-4 z-50 rounded-md px-4 py-3 shadow-lg border ${
              toast.type === "success"
                ? "bg-green-50 border-green-300 text-green-800"
                : "bg-red-50 border-red-300 text-red-800"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="font-semibold">
                {toast.type === "success" ? "Success" : "Error"}
              </span>
              <span className="text-sm">{toast.message}</span>
              <button
                onClick={() => setToast({ type: "", message: "" })}
                className="ml-2 text-sm opacity-70 hover:opacity-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Projects</h2>
          <button
            onClick={() => navigate("/projects/new")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            New Project
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <select
            value={filters.active}
            onChange={(e) =>
              setFilters({ ...filters, active: e.target.value === "true" })
            }
            className="border p-2 rounded-md"
          >
            <option value="true">Active</option>
            <option value="false">Archived</option>
          </select>

          <select
            value={filters.clientId}
            onChange={(e) => setFilters({ ...filters, clientId: e.target.value })}
            className="border p-2 rounded-md"
          >
            <option value="">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || c.companyName}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="border p-2 rounded-md flex-1"
          />
        </div>

        {/* Projects Table */}
        <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
          <table className="w-full border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="border p-2">ID</th>
                <th className="border p-2">Client</th>
                <th className="border p-2">Project Name</th>
                <th className="border p-2">Code</th>
                <th className="border p-2">Hourly Rate</th>
                <th className="border p-2">Start Date</th>
                <th className="border p-2">End Date</th>
                <th className="border p-2">Active</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length > 0 ? (
                projects.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-100">
                    <td className="border p-2">{p.id}</td>
                    <td className="border p-2">
                      {p.client?.name || p.client?.companyName}
                    </td>
                    <td className="border p-2">{p.projectName}</td>
                    <td className="border p-2">{p.code}</td>
                    <td className="border p-2">{p.hourlyRate}</td>
                    <td className="border p-2">{p.startDate}</td>
                    <td className="border p-2">{p.endDate}</td>
                    <td className="border p-2">{p.isActive ? "Yes" : "No"}</td>
                    <td className="border p-2 flex gap-2">
                      <Link
                        to={`/projects/edit/${p.id}`}
                        state={{ project: p }}
                        className="px-2 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleArchive(p.id, p.isActive)}
                        className={`px-2 py-1 rounded-md text-white ${
                          p.isActive
                            ? "bg-gray-600 hover:bg-gray-700"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {p.isActive ? "Archive" : "Unarchive"}
                      </button>
                      <button
                        onClick={() => confirmDelete(p.id)}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    className="border p-4 text-center text-gray-500 text-sm"
                  >
                    No projects available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Confirm delete modal inline */}
        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h2 className="text-lg font-semibold mb-4">Confirm delete</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete project #{toDeleteProjectId}?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setConfirmOpen(false);
                    setToDeleteProjectId(null);
                  }}
                  disabled={deleteLoading}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className={`px-4 py-2 rounded-md text-white ${
                    deleteLoading
                      ? "bg-red-300 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ListProjects;
