// src/pages/tasks/EditTaskPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import tasksApi from "../../api/tasksApi"; // ensure tasksApi exports get(id) and update(id,payload)
import TaskForm from "./TaskForm";

export default function EditTaskPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await tasksApi.get(id); // should return DTO object or axios response
        const data = res?.data?.data ?? res?.data ?? res;
        if (!mounted) return;
        setTask(data);
      } catch (err) {
        console.error("Failed to load task", err);
        setError(err?.message || "Failed to load task");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  async function handleSave(payload) {
    try {
      await tasksApi.update(id, payload);
      navigate("/tasks");
    } catch (err) {
      // better logging for axios errors
      console.error("Failed to save task", err);
      if (err?.response) {
        // server sent a response (status, body)
        console.error("Status:", err.response.status, "Data:", err.response.data);
        alert(err.response?.data?.message || `Save failed (status ${err.response.status})`);
      } else if (err?.request) {
        // request made but no response
        console.error("No response (request):", err.request);
        alert("No response from server. Check network or server logs.");
      } else {
        // something else
        alert(err.message || "Failed to save");
      }
    }
  }


  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!task) return <div className="p-6 text-gray-600">Task not found</div>;

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="text-2xl font-bold mb-4">Edit Task</div>
      <TaskForm
        initial={task}
        projectId={task.projectId}
        onCancel={() => navigate(-1)}
        onSave={handleSave}
      />
    </div>
  );
}
