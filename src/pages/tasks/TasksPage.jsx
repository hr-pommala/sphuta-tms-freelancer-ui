// src/pages/tasks/TasksPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import tasksApi from "../../api/tasksApi";
import TaskList from "./TaskList";
import TaskForm from "./TaskForm";
import Modal from "../../components/ui/Modal";
import Drawer from "../../components/ui/Drawer";
import ConfirmModal from "../../components/ui/ConfirmModal";
import api from "../../api/axios"; // used to load projects

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

  // projects map (id -> { id, name, ... })
  const [projectsMap, setProjectsMap] = useState({});
  const [loadingProjects, setLoadingProjects] = useState(false);

  const [projectName, setProjectName] = useState(null);
  const [loadingProjectName, setLoadingProjectName] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  useEffect(() => {
    // auto-open if prop true or /tasks/new in URL
    if (openCreateOnMount || (location?.pathname && location.pathname.includes("/tasks/new"))) {
      setShowForm(true);
    }
  }, [openCreateOnMount, location?.pathname]);

  // load projects list (to map ids -> names for display)
  useEffect(() => {
    let mounted = true;
    async function loadProjects() {
      setLoadingProjects(true);
      try {
        const qs = new URLSearchParams();
        qs.append("active", true);
        qs.append("page", 0);
        qs.append("size", 200);
        const url = `/projects/projects?${qs.toString()}`;
        const res = await api.get(url);
        const candidate = res?.data?.data?.content ?? res?.data?.data ?? res?.data ?? res;
        const list = Array.isArray(candidate) ? candidate : [];
        const map = {};
        list.forEach(raw => {
          const id = raw.id ?? raw.projectId;
          const name = raw.projectName ?? raw.name ?? raw.title ?? raw.code ?? `#${id}`;
          if (id !== undefined && id !== null) map[String(id)] = { id, name, __raw: raw };
        });
        if (!mounted) return;
        setProjectsMap(map);
      } catch (err) {
        console.error("Failed to load projects map", err);
        if (!mounted) return;
        setProjectsMap({});
      } finally {
        if (mounted) setLoadingProjects(false);
      }
    }
    loadProjects();
    return () => { mounted = false; };
  }, []);

  // if we have a projectId (coming from a project page), fetch the project's name (for modal title)
  useEffect(() => {
    let mounted = true;
    async function loadProjectName() {
      if (!projectId) {
        setProjectName(null);
        return;
      }
      setLoadingProjectName(true);
      try {
        // try to use projectsMap first
        const fromMap = projectsMap[String(projectId)];
        if (fromMap) {
          if (mounted) setProjectName(fromMap.name);
          return;
        }
        // fallback to API get
        const p = await api.get(`/projects/${projectId}`).then(res => res?.data?.data ?? res?.data ?? res);
        if (!mounted) return;
        setProjectName(p?.projectName ?? p?.name ?? `#${p?.id ?? projectId}`);
      } catch (err) {
        console.error("Failed to fetch project name", err);
        if (mounted) setProjectName(`#${projectId}`);
      } finally {
        if (mounted) setLoadingProjectName(false);
      }
    }
    loadProjectName();
    return () => {
      mounted = false;
    };
  }, [projectId, projectsMap]);

  /* ---------------- showToast helper (small top-right toast) ---------------- */
  function showToast(message = "", opts = { type: "info", timeout: 4000 }) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const el = document.createElement("div");
    el.id = id;
    el.style.position = "fixed";
    el.style.right = "20px";
    el.style.top = "20px";
    el.style.zIndex = 9999;
    el.style.background = opts.type === "error" ? "#fee2e2" : "#ecfdf5";
    el.style.color = opts.type === "error" ? "#991b1b" : "#065f46";
    el.style.border = "1px solid rgba(0,0,0,0.06)";
    el.style.padding = "12px 16px";
    el.style.borderRadius = "8px";
    el.style.boxShadow = "0 6px 18px rgba(0,0,0,0.06)";
    el.style.fontSize = "14px";
    el.innerText = message;
    document.body.appendChild(el);
    setTimeout(() => {
      try { el.style.transition = "opacity 300ms"; el.style.opacity = "0"; } catch (e) {}
      setTimeout(() => { try { document.body.removeChild(el); } catch (e) {} }, 350);
    }, opts.timeout || 4000);
  }

  // inside src/pages/tasks/TasksPage.jsx (fetchTasks)
  async function fetchTasks() {
    setLoading(true);
    setError(null);
    try {
      const data = projectId ? await tasksApi.listByProject(projectId) : await tasksApi.listAll();
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
      // tasksApi.create expects (projectId, payload)
      const created = await tasksApi.create(payload.projectId || projectId, payload);
      setTasks((prev) => [created, ...prev]);
      setShowForm(false);
      showToast("Task created", { type: "info", timeout: 2500 });
      if (location.pathname.includes("/tasks/new")) navigate("/tasks", { replace: true });
      return created;
    } catch (err) {
      // replace alert with toast + rethrow so TaskForm can set inline error if it wants
      showToast(err?.message || "Failed to create task", { type: "error", timeout: 4500 });
      throw err;
    }
  }

  function startCreate() {
    setEditing(null);
    setShowForm(true);
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
      showToast("Task deleted", { type: "info", timeout: 2500 });
    } catch (err) {
      showToast(err?.message || "Failed to delete", { type: "error", timeout: 4500 });
    }
  }

  async function openDetails(task) {
    if (!task?.id) return;
    try {
      const data = await tasksApi.get(task.id);
      setDetails(data);
    } catch (err) {
      showToast("Failed to load details", { type: "error" });
    }
  }

  const filtered = tasks.filter((t) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (t.taskName || "").toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q);
  });

  const modalTitle = projectId ? `Create Task — ${projectName ?? (loadingProjectName ? "Loading…" : `#${projectId}`)}` : "Create Task";

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
          <TaskList tasks={filtered} projectsMap={projectsMap} onOpen={openDetails} onDelete={confirmDelete} />
        )}
      </div>

      <Modal
        open={showForm}
        title={modalTitle}
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

            <div className="text-xs text-gray-400">Created: {details.createdDt ? new Date(details.createdDt).toLocaleString() : "-"}</div>
            <div className="text-xs text-gray-400">Updated: {details.updatedDt ? new Date(details.updatedDt).toLocaleString() : "-"}</div>

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
