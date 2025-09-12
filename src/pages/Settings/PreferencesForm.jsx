// src/pages/settings/PreferenceForm.jsx
import React, { useEffect, useState } from "react";
import preferencesApi from "../../api/preferencesApi";
import { useNavigate, useParams } from "react-router-dom";

const WEEK_OPTIONS = ["MON", "SUN"];
const ROUNDING_OPTIONS = ["NONE", "NEAREST_15", "NEAREST_30"];

const PreferenceForm = () => {
  const { userId: routeUserId } = useParams();
  const isEdit = Boolean(routeUserId);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    userId: null, // keep null until user enters integer
    dateFormat: "YYYY-MM-DD",
    weekStartsOn: "MON",
    rounding: "NONE",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const normalize = (raw) => ({
    userId: raw.userId ?? raw.user_id ?? null,
    dateFormat: raw.dateFormat ?? raw.date_format ?? "YYYY-MM-DD",
    weekStartsOn: raw.weekStartsOn ?? raw.week_starts_on ?? "MON",
    rounding: raw.rounding ?? raw.rounding ?? "NONE",
    ...raw,
  });

  useEffect(() => {
    if (isEdit) {
      load(Number(routeUserId));
    } else {
      setForm({
        userId: null,
        dateFormat: "YYYY-MM-DD",
        weekStartsOn: "MON",
        rounding: "NONE",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeUserId]);

  const load = async (id) => {
    setLoading(true);
    try {
      const res = await preferencesApi.getById(id);
      const raw = res?.data?.data ?? res?.data ?? null;
      if (!raw) {
        alert("Preference not found");
        navigate("/settings/preferences");
        return;
      }
      const payload = normalize(raw);
      setForm({
        userId: payload.userId ?? id,
        dateFormat: payload.dateFormat,
        weekStartsOn: payload.weekStartsOn,
        rounding: payload.rounding,
      });
    } catch (err) {
      console.error("Failed to load preference", err);
      alert("Failed to load preference.");
      navigate("/settings/preferences");
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    if (form.userId === null || isNaN(form.userId)) {
      alert("UserId (integer) is required.");
      return false;
    }
    if (form.dateFormat !== "YYYY-MM-DD") {
      alert("Date format must be exactly 'YYYY-MM-DD'.");
      return false;
    }
    if (!WEEK_OPTIONS.includes(form.weekStartsOn)) {
      alert("Week Starts On must be one of: " + WEEK_OPTIONS.join(", "));
      return false;
    }
    if (!ROUNDING_OPTIONS.includes(form.rounding)) {
      alert("Rounding must be a known option.");
      return false;
    }
    return true;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === "userId") {
      setForm((f) => ({
        ...f,
        userId: value === "" ? null : parseInt(value, 10),
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        userId: form.userId,
        dateFormat: form.dateFormat,
        weekStartsOn: form.weekStartsOn,
        rounding: form.rounding,
      };

      if (isEdit) {
        await preferencesApi.update(form.userId, payload);
        alert("Preferences updated successfully.");
      } else {
        await preferencesApi.create(payload);
        alert("Preferences created successfully.");
      }

      navigate("/settings/preferences");
    } catch (err) {
      console.error("Save failed", err);
      const message = err?.response?.data?.message ?? err?.message ?? "Save failed";
      alert("Error: " + message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading preference...</div>;

  return (
    <form onSubmit={onSave} className="space-y-4 max-w-xl">
      <div>
        <label className="block text-sm font-medium mb-1">User ID</label>
        <input
          type="number"
          name="userId"
          value={form.userId ?? ""}
          onChange={onChange}
          disabled={isEdit}
          className="w-full border rounded p-2"
          placeholder="e.g. 101"
        />
        {isEdit && <p className="text-xs text-slate-500 mt-1">User ID cannot be changed.</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Date Format</label>
        <input
          name="dateFormat"
          value={form.dateFormat}
          onChange={onChange}
          className="w-full border rounded p-2"
        />
        <p className="text-xs text-slate-500 mt-1">Must be exactly: <code>YYYY-MM-DD</code></p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Week Starts On</label>
        <select name="weekStartsOn" value={form.weekStartsOn} onChange={onChange} className="w-full border rounded p-2">
          {WEEK_OPTIONS.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Rounding</label>
        <select name="rounding" value={form.rounding} onChange={onChange} className="w-full border rounded p-2">
          {ROUNDING_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60"
        >
          {isEdit ? (saving ? "Saving..." : "Save Changes") : (saving ? "Creating..." : "Create Preference")}
        </button>

        <button
          type="button"
          onClick={() => navigate("/settings/preferences")}
          className="px-4 py-2 bg-slate-200 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default PreferenceForm;
