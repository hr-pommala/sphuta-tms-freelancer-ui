// replace the entire file you posted with this content
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * TaskCard
 *
 * - projectName: string (displayed as "Project 1" — no "Project: " prefix)
 * - tasks: array of task DTOs
 * - onOpen(task): (kept for backwards compat) — NOT used for Edit navigation anymore
 * - onDelete(task): called when user selects Delete (should show delete confirmation)
 *
 * Layout: full-width horizontal card (stacked vertically on the page).
 *
 * Edit now navigates to /tasks/:id/edit directly.
 * Actions button uses a dropdown caret icon.
 */
export default function TaskCard({ projectName, tasks = [], onOpen = () => {}, onDelete = () => {} }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border w-full">
      {/* Project title */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold">{projectName}</h2>
      </div>

      {/* Task list: each task is a horizontal row */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-gray-500 italic">No tasks yet</div>
        ) : (
          tasks.map((task) => (
            <TaskRow
              key={task.id ?? task.tempId ?? Math.random()}
              task={task}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

/* --- TaskRow component --- */
/* Keeps its own local menu state and supports keyboard/escape to close. */
function TaskRow({ task, onDelete }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const navigate = useNavigate();

  // close when clicking outside or pressing Escape
  useEffect(() => {
    function handleClick(e) {
      if (!menuRef.current) return;
      if (menuRef.current.contains(e.target) || btnRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const created = task.createdDt ? new Date(task.createdDt).toLocaleString() : "-";

  return (
    <div className="flex items-start justify-between gap-4">
      {/* Left: task info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-lg break-words">{task.taskName ?? "—"}</div>
        <div className="text-sm text-gray-600 mt-1 break-words">
          {task.description || <span className="text-gray-400">No description</span>}
        </div>
        <div className="text-xs text-gray-400 mt-2">Created: {created}</div>
      </div>

      {/* Right: Actions dropdown with caret icon */}
      <div className="flex-shrink-0 relative">
        <button
          ref={btnRef}
          onClick={() => setOpen((s) => !s)}
          aria-haspopup="true"
          aria-expanded={open}
          className="inline-flex items-center justify-center px-3 py-1 border rounded text-sm bg-white"
          title="Actions"
        >
          Actions
          {/* simple caret/down icon */}
          <svg className="ml-2 w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path d="M5.23 7.21a.75.75 0 011.06-.02L10 10.67l3.71-3.48a.75.75 0 111.04 1.08l-4.24 3.98a.75.75 0 01-1.04 0L5.25 8.27a.75.75 0 01-.02-1.06z" />
          </svg>
        </button>

        {open && (
          <div
            ref={menuRef}
            role="menu"
            aria-label={`Actions for ${task.taskName}`}
            className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md z-10"
          >
            <button
              onClick={() => {
                setOpen(false);
                // navigate directly to edit page (no drawer)
                if (task?.id) {
                  navigate(`/tasks/${task.id}/edit`);
                } else {
                  // fallback: if no id, try projectId + tempId or do nothing
                  console.warn("Cannot navigate to edit: task has no id", task);
                }
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
              role="menuitem"
            >
              Edit
            </button>

            <button
              onClick={() => {
                setOpen(false);
                // Delete should show delete confirmation from parent
                onDelete(task);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600"
              role="menuitem"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
