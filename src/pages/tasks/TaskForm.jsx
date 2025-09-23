// src/pages/tasks/TaskForm.jsx
import React, { useState, useEffect } from "react";

export default function TaskForm({ initial = {}, projectId, onCancel, onSave }) {
  const [taskName, setTaskName] = useState(initial.taskName || "");
  const [description, setDescription] = useState(initial.description || "");
  const [project, setProject] = useState(projectId ?? initial.projectId ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setTaskName(initial.taskName || "");
    setDescription(initial.description || "");
    setProject(projectId ?? initial.projectId ?? "");
    setError(null);
  }, [initial, projectId]);

  async function submit(e) {
    e?.preventDefault();
    if (!taskName.trim()) {
      setError("Task name is required");
      return;
    }
    if (!project) {
      setError("Project ID is required (select or enter a project).");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      // caller expects payload with projectId sometimes; we'll pass it
      await onSave({
        taskName: taskName.trim(),
        description: description || null,
        projectId: Number(project),
      });
    } catch (err) {
      setError(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          className="mt-1 block w-full border rounded-md p-2"
          placeholder="Enter task title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="mt-1 block w-full border rounded-md p-2"
          placeholder="Optional description"
        />
      </div>

      {/* Show project input only if projectId not passed from parent */}
      {!projectId && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Project ID</label>
          <input
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
            placeholder="Enter project id (required)"
            type="number"
            min="1"
          />
        </div>
      )}

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md border">Cancel</button>
        <button type="submit" disabled={saving} className="px-4 py-2 rounded-md bg-blue-600 text-white">
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
