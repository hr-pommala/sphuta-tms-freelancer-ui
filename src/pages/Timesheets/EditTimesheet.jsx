// src/pages/Timesheets/EditTimesheet.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTimesheet, updateTimesheet } from "../../api/timesheets";

const EditTimesheet = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    projectId: "",
    periodStart: "",
    periodEnd: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getTimesheet(id);
        // normalize possible wrappers
        const data = res?.data?.data ?? res?.data ?? res;
        setForm({
          projectId: data.projectId ?? "",
          periodStart: data.periodStart ?? "",
          periodEnd: data.periodEnd ?? "",
        });
      } catch (err) {
        console.error("Failed to load timesheet", err);
        alert("Failed to load timesheet");
        navigate("/timesheets");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    // prepare payload with types expected by backend
    const payload = {
      projectId: parseInt(form.projectId, 10),
      periodStart: form.periodStart,
      periodEnd: form.periodEnd,
    };

    console.debug("PUT /timesheets/%s payload:", id, payload);

    try {
      // call api
      const res = await updateTimesheet(id, payload);

      // Try to read server message if wrapped
      const serverBody = res?.data?.data ?? res?.data ?? res;
      console.debug("Update response:", serverBody);

      // success -> go back to list
      alert("Timesheet updated");
      navigate("/timesheets");
    } catch (err) {
      // err can be an axios Error or our axios-interceptor error object
      console.error("Update failed (raw):", err);
      // try to extract meaningful message
      const msg =
        err?.response?.data?.message ??
        err?.response?.data ??
        err?.message ??
        (typeof err === "string" ? err : "Update failed");
      // show raw response if available
      let details = "";
      try {
        if (err?.response?.data) details = JSON.stringify(err.response.data);
        else if (err?.body) details = JSON.stringify(err.body);
      } catch (x) { /* ignore */ }

      setError(msg + (details ? ` — ${details}` : ""));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Edit Timesheet #{id}</h2>

      {error && (
        <div className="mb-3 text-red-700 bg-red-100 p-3 rounded">
          <strong>Update failed</strong>
          <div className="mt-1 text-sm">{error}</div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Project ID</label>
          <input
            type="number"
            name="projectId"
            value={form.projectId}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Period Start</label>
          <input
            type="text"
            name="periodStart"
            value={form.periodStart}
            onChange={handleChange}
            placeholder="YYYY-MM-DD"
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Period End</label>
          <input
            type="text"
            name="periodEnd"
            value={form.periodEnd}
            onChange={handleChange}
            placeholder="YYYY-MM-DD"
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 text-white py-2 rounded">
            {saving ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={() => navigate("/timesheets")} className="flex-1 bg-gray-500 text-white py-2 rounded">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTimesheet;
