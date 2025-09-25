// src/pages/tasks/TaskList.jsx
import React from "react";
import ProjectTaskCard from "./TaskCard";

/**
 * TaskList groups tasks by project and renders one horizontal (full-width) card per project,
 * stacked vertically (no side-by-side layout).
 *
 * Props:
 *  - tasks: array of task objects
 *  - projectsMap: optional object keyed by projectId -> { id, name, ... }
 *  - onOpen, onDelete
 */
export default function TaskList({ tasks = [], projectsMap = {}, onOpen, onDelete }) {
  // Group tasks by a stable project key (prefer name, fall back to id or "No Project")
  const grouped = tasks.reduce((acc, t) => {
    // try multiple candidates for a friendly name
    const candidateName =
      t.projectName ?? // DTO might include projectName
      (t.project && (t.project.projectName ?? t.project.name)) ?? // nested project object
      (projectsMap && projectsMap[String(t.projectId)] && projectsMap[String(t.projectId)].name) ?? // map from parent
      t.__raw?.projectName ?? // raw shape
      (t.projectId ? `Project ${t.projectId}` : "No Project");

    // remove noisy prefixes
    const projectName = String(candidateName).replace(/^Project:\s*/i, "").trim() || "No Project";

    if (!acc[projectName]) acc[projectName] = [];
    acc[projectName].push(t);
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
