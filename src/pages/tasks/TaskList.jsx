import React from "react";
import ProjectTaskCard from "./TaskCard";

/**
 * TaskList groups tasks by project and renders one horizontal (full-width) card per project,
 * stacked vertically (no side-by-side layout).
 */
export default function TaskList({ tasks = [], onOpen, onDelete }) {
  // Group tasks by a stable project key (prefer name, fall back to id or "No Project")
  const grouped = tasks.reduce((acc, t) => {
    const projectName =
      t.projectName ??
      t.project?.name ??
      t.__raw?.projectName ??
      (t.projectId ? `Project ${t.projectId}` : "No Project");

    // normalize title to remove any "Project:" prefix if present
    const normalized = projectName.replace(/^Project:\s*/i, "").trim() || "No Project";

    if (!acc[normalized]) acc[normalized] = [];
    acc[normalized].push(t);
    return acc;
  }, {});

  return (
    // Use a vertical stack so projects appear one-per-row (full-width card)
    <div className="flex flex-col gap-6">
      {Object.entries(grouped).map(([projectName, projectTasks]) => (
        <ProjectTaskCard
          key={projectName}
          projectName={projectName}
          tasks={projectTasks}
          onOpen={onOpen}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
