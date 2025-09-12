// src/pages/settings/SettingsProfileForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createProfile, getProfile, updateProfile } from "../../api/settingsProfile";

const PHONE_REGEX = /^[+0-9\-\s]*$/;

const SettingsProfileForm = () => {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    userId: "",
    fullName: "",
    phone: "",
    timezone: Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone ?? "UTC",
    locale: navigator?.language ?? "en_US",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) loadProfile();
    // eslint-disable-next-line
  }, [id]);

  const loadProfile = async () => {
    try {
      const res = await getProfile(id);
      const data = res?.data?.data ?? res?.data;
      setForm({
        userId: data.userId ?? id,
        fullName: data.fullName ?? "",
        phone: data.phone ?? "",
        timezone: data.timezone ?? form.timezone,
        locale: data.locale ?? form.locale,
      });
    } catch (err) {
      console.error("Failed to load profile", err);
      window.alert("Failed to load profile");
      navigate("/settings/profile");
    }
  };

  const validate = () => {
    const e = {};
    if (!form.fullName || !form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.timezone || !form.timezone.trim()) e.timezone = "Timezone is required";
    if (!form.locale || !form.locale.trim()) e.locale = "Locale is required";
    if (form.phone && !PHONE_REGEX.test(form.phone)) e.phone = "Invalid phone format";
    if (!editing) {
      if (form.userId === "" || form.userId === null || form.userId === undefined) e.userId = "User ID is required for new profile";
      else if (isNaN(Number(form.userId))) e.userId = "User ID must be numeric";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        userId: Number(form.userId),
        fullName: form.fullName,
        phone: form.phone,
        timezone: form.timezone,
        locale: form.locale,
      };

      if (editing) {
        await updateProfile(id, payload);
        window.alert("Profile updated");
      } else {
        await createProfile(payload);
        window.alert("Profile created");
      }
      navigate("/settings/profile");
    } catch (err) {
      console.error("Save failed", err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || "Save failed";
      window.alert(String(msg));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">{editing ? "Edit" : "New"} Settings Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        {!editing && (
          <div>
            <label className="block text-sm font-medium">User ID</label>
            <input
              value={form.userId}
              onChange={handleChange("userId")}
              type="text"
              className="mt-1 w-full border rounded px-3 py-2"
            />
            {errors.userId && <p className="text-red-600 text-sm mt-1">{errors.userId}</p>}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium">Full name</label>
          <input
            value={form.fullName}
            onChange={handleChange("fullName")}
            type="text"
            className="mt-1 w-full border rounded px-3 py-2"
            required
          />
          {errors.fullName && <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input
            value={form.phone}
            onChange={handleChange("phone")}
            type="text"
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="+1-202-555-0173"
          />
          {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Timezone</label>
            <input
              value={form.timezone}
              onChange={handleChange("timezone")}
              type="text"
              className="mt-1 w-full border rounded px-3 py-2"
            />
            {errors.timezone && <p className="text-red-600 text-sm mt-1">{errors.timezone}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Locale</label>
            <input
              value={form.locale}
              onChange={handleChange("locale")}
              type="text"
              className="mt-1 w-full border rounded px-3 py-2"
            />
            {errors.locale && <p className="text-red-600 text-sm mt-1">{errors.locale}</p>}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => navigate("/settings/profile")}
            className="px-4 py-2 border rounded"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {saving ? "Saving..." : editing ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsProfileForm;
