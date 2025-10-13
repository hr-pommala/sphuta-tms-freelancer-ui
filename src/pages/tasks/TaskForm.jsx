// src/pages/tasks/TaskForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

/**
 * TaskForm
 *
 * Props:
 *  - initial: initial task values { taskName, description, projectId }
 *  - projectId: optional (when opened from a Project page)
 *  - onCancel: () => void
 *  - onSave: (payload) => Promise  // payload includes { taskName, description, projectId }
 *
 * Notes:
 *  - Modal / parent should render the main title. TaskForm renders only the form body.
 *  - Project select is shown first. If parent supplied projectId it resolves & displays name and hides select.
 */
export default function TaskForm({ initial = {}, projectId: propProjectId, onCancel, onSave }) {
  const [taskName, setTaskName] = useState(initial.taskName || "");
  const [description, setDescription] = useState(initial.description || "");
  const [project, setProject] = useState(propProjectId ?? initial.projectId ?? "");
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  // reset when initial or project prop changes
  useEffect(() => {
    setTaskName(initial.taskName || "");
    setDescription(initial.description || "");
    setProject(propProjectId ?? initial.projectId ?? "");
    setFormError(null);
  }, [initial, propProjectId]);

  // load projects using the same endpoint your TimeEntry page uses
  async function loadProjects() {
    setLoadingProjects(true);
    setFetchError(null);
    try {
      const qs = new URLSearchParams();
      qs.append("active", true);
      qs.append("page", 0);
      qs.append("size", 200);
      const url = `/projects/projects?${qs.toString()}`;

      const res = await api.get(url);
      // possible wrapped shapes: res.data.data.content | res.data.data | res.data
      const candidate = res?.data?.data?.content ?? res?.data?.data ?? res?.data ?? res;
      const list = Array.isArray(candidate) ? candidate : [];
      const normalized = list.map(raw => ({
        id: raw.id ?? raw.projectId ?? raw.timesheetId,
        name: raw.projectName ?? raw.name ?? raw.title ?? raw.code ?? `#${raw.id ?? raw.projectId}`,
        code: raw.code ?? raw.projectCode ?? "",
        hourlyRate: raw.hourlyRate ?? raw.rate ?? raw.hourly ?? null,
        startDate: raw.startDate ?? raw.periodStart ?? null,
        endDate: raw.endDate ?? raw.periodEnd ?? null,
        isActive: raw.isActive ?? raw.active ?? true,
        client: raw.client ?? raw.clientDto ?? null,
        __raw: raw,
      }));
      setProjects(normalized);
    } catch (err) {
      console.error("[TaskForm] failed to load projects:", err);
      setFetchError(err?.message || "Failed to load projects");
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  }

  useEffect(() => {
    // fetch on mount
    loadProjects();
  }, []);

  const selectedProjectObj = useMemo(
    () => projects.find((p) => String(p.id) === String(project)),
    [projects, project]
  );

  async function handleSubmit(e) {
    e?.preventDefault();
    setFormError(null);

    if (!taskName.trim()) {
      setFormError("Task name is required.");
      return;
    }
    const projectToUse = project || propProjectId || initial.projectId;
    if (!projectToUse) {
      setFormError("Please select a project.");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        taskName: taskName.trim(),
        description: description || null,
        projectId: Number(projectToUse),
      });
    } catch (err) {
      console.error("TaskForm save failed:", err);
      setFormError(err?.message || "Save failed");
      throw err;
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Project control (first) */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Project</label>

        {propProjectId ? (
          // parent provided projectId: show resolved name (or fallback id) and small info message
          <div className="mt-1">
            {loadingProjects ? (
              <div className="p-2 text-sm text-gray-500">Resolving project…</div>
            ) : selectedProjectObj ? (
              <div className="flex items-center justify-between gap-3">
                <div className="px-3 py-1 rounded border bg-white">{selectedProjectObj.name}</div>
              </div>
            ) : (
              <div className="px-3 py-1 rounded border bg-white">Project #{propProjectId}</div>
            )}
            <div className="mt-1 text-xs text-gray-500">This task will be created for the above project.</div>
          </div>
        ) : (
          // no propProjectId: allow selection from dropdown
          <div>
            {loadingProjects ? (
              <div className="mt-1 p-2 text-sm text-gray-500">Loading projects…</div>
            ) : fetchError ? (
              <div className="mt-1">
                <div className="text-sm text-red-600">Failed to load projects: {fetchError}</div>
                <div className="mt-2">
                  <button type="button" onClick={loadProjects} className="px-3 py-1 rounded border bg-gray-100">
                    Retry
                  </button>
                </div>
              </div>
            ) : projects.length === 0 ? (
              <div className="mt-1 p-2 text-sm text-gray-500">No projects found.</div>
            ) : (
              <>
                <select
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="mt-1 block w-full border rounded-md p-2"
                  aria-required="true"
                >
                  <option value=""> Select Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                {/* small info message */}
                {project && (
                  <div className="mt-2 text-xs text-gray-600">
                    This task will be created for: <strong>{selectedProjectObj?.name ?? `#${project}`}</strong>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Title (second) */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          className="mt-1 block w-full border rounded-md p-2"
          placeholder="Enter task title"
        />
      </div>

      {/* Description (third) */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 block w-full border rounded-md p-2"
          placeholder="Optional description"
        />
      </div>

      {formError && <div className="text-sm text-red-600">{formError}</div>}

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md border">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="px-4 py-2 rounded-md bg-blue-600 text-white">
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
