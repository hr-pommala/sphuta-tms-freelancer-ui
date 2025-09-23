// src/pages/tasks/TasksPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import tasksApi from "../../api/tasksApi";
import TaskList from "./TaskList";
import TaskForm from "./TaskForm";
import Modal from "../../components/ui/Modal";
import Drawer from "../../components/ui/Drawer";
import ConfirmModal from "../../components/ui/ConfirmModal";

export default function TasksPage({ projectId = null, openCreateOnMount = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [details, setDetails] = useState(null);

  const [toDelete, setToDelete] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  useEffect(() => {
    // auto-open if prop true or /tasks/new in URL
    if (openCreateOnMount || (location?.pathname && location.pathname.includes("/tasks/new"))) {
      setShowForm(true);
    }
  }, [openCreateOnMount, location?.pathname]);

 // inside src/pages/tasks/TasksPage.jsx (fetchTasks)
 async function fetchTasks() {
   setLoading(true);
   setError(null);
   try {
     const data = projectId ? await tasksApi.listByProject(projectId) : await tasksApi.listAll();
     console.log("fetchTasks data:", data);
     // ensure tasks is an array
     setTasks(Array.isArray(data) ? data : (data ? [data] : []));
   } catch (err) {
     setError(err?.message || "Failed to fetch");
   } finally {
     setLoading(false);
   }
 }


  async function handleCreate(payload) {
    try {
      const created = await tasksApi.create(payload.projectId || projectId, payload);
      console.log("created:", created);
      setTasks(prev => [created, ...prev]);
      setShowForm(false);
      if (location.pathname.includes("/tasks/new")) navigate("/tasks", { replace: true });
    } catch (err) {
      alert(err?.message || "Failed to create task");
    }
  }


  function startCreate() {
    setEditing(null);
    setShowForm(true);
    // optionally: navigate("/tasks/new");
  }

  function startEdit(task) {
    navigate(`/tasks/${task.id}/edit`);
  }

  function confirmDelete(task) {
    setToDelete(task);
    setConfirmOpen(true);
  }

  async function onConfirmDelete() {
    if (!toDelete?.id) return;
    try {
      await tasksApi.delete(toDelete.id);
      setTasks((prev) => prev.filter((t) => t.id !== toDelete.id));
      setToDelete(null);
      setConfirmOpen(false);
      if (details?.id === toDelete.id) setDetails(null);
    } catch (err) {
      alert(err?.message || "Failed to delete");
    }
  }

  async function openDetails(task) {
    if (!task?.id) return;
    try {
      const data = await tasksApi.get(task.id);
      setDetails(data);
    } catch (err) {
      alert("Failed to load details");
    }
  }

  const filtered = tasks.filter((t) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (t.taskName || "").toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q);
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="text-2xl font-bold">Tasks</div>
          <div className="text-sm text-gray-500">Manage tasks for your projects</div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex-1 flex items-center gap-2">
            <input
              placeholder="Search tasks..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border rounded-md p-2"
            />
          </div>

          <div className="flex items-center gap-2">
            <button onClick={startCreate} className="px-3 py-2 rounded-md bg-blue-600 text-white flex items-center gap-2">
              + <span className="hidden sm:inline">Create Task</span>
            </button>
          </div>
        </div>
      </div>

      <div>
        {loading ? (
          <div className="p-6">Loading tasks...</div>
        ) : error ? (
          <div className="p-6 text-red-600">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted">
            <div className="text-xl font-semibold">No tasks found</div>
            <div className="mt-2 text-sm text-gray-500">Try creating your first task or change the search</div>
          </div>
        ) : (
          <TaskList tasks={filtered} onOpen={openDetails} onDelete={confirmDelete} />
        )}
      </div>

      <Modal
        open={showForm}
        title={"Create Task"}
        onClose={() => {
          setShowForm(false);
          if (location.pathname.includes("/tasks/new")) navigate("/tasks", { replace: true });
        }}
      >
        <TaskForm
          initial={editing || {}}
          projectId={projectId || editing?.projectId}
          onCancel={() => {
            setShowForm(false);
            if (location.pathname.includes("/tasks/new")) navigate("/tasks", { replace: true });
          }}
          onSave={handleCreate}
        />
      </Modal>

      <Drawer open={!!details} title={details?.taskName || "Details"} onClose={() => setDetails(null)}>
        {details ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-500">Task ID: {details.id}</div>
            <div className="text-sm text-gray-500">Project ID: {details.projectId}</div>
            <div className="font-semibold text-lg">{details.taskName}</div>
            <div className="text-gray-700">{details.description || "No description"}</div>

            <div className="text-xs text-gray-400">Created: {details.createdDt ? new Date(details.createdDt).toLocaleString() : '-'}</div>
            <div className="text-xs text-gray-400">Updated: {details.updatedDt ? new Date(details.updatedDt).toLocaleString() : '-'}</div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => startEdit(details)} className="px-3 py-2 rounded bg-gray-100">Edit</button>
              <button onClick={() => confirmDelete(details)} className="px-3 py-2 rounded bg-red-50 text-red-600">Delete</button>
            </div>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </Drawer>

      <ConfirmModal
        open={confirmOpen}
        title="Delete task"
        message={`Are you sure you want to delete "${toDelete?.taskName || ""}"? This cannot be undone.`}
        onCancel={() => { setConfirmOpen(false); setToDelete(null); }}
        onConfirm={onConfirmDelete}
      />
    </div>
  );
}
