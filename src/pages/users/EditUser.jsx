// src/pages/Users/EditUser.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import moment from "moment-timezone";
import locales from "locale-codes";
import currencyCodes from "currency-codes";

import { getUser, putUser } from "../../api/users";

const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const buildLocaleOptions = () => {
  try {
    const all = locales.all || [];
    const picked = all.map((l) => ({ value: l.tag, label: l.name || l.tag })).filter(Boolean);
    const uniq = Array.from(new Map(picked.map((p) => [p.value, p])).values());
    return uniq.sort((a, b) => a.label.localeCompare(b.label));
  } catch (e) {
    return [
      { value: "en_US", label: "English (United States)" },
      { value: "en_GB", label: "English (United Kingdom)" },
      { value: "fr_FR", label: "Français (France)" },
      { value: "hi_IN", label: "हिन्दी (India)" },
    ];
  }
};

const buildTimezoneOptions = () => {
  try {
    return moment.tz.names();
  } catch {
    return ["UTC"];
  }
};

const buildCurrencyOptions = () => {
  try {
    const codes = currencyCodes.codes();
    return codes.map((c) => ({ value: c, label: c }));
  } catch {
    return [
      { value: "USD", label: "USD" },
      { value: "INR", label: "INR" },
      { value: "EUR", label: "EUR" },
    ];
  }
};

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState(null);

  const [localeOptions] = useState(buildLocaleOptions);
  const [timezoneOptions] = useState(buildTimezoneOptions);
  const [currencyOptions] = useState(buildCurrencyOptions);

  const load = async () => {
    setBusy(true);
    setBanner(null);
    try {
      const res = await getUser(id);
      const user = res?.data?.data ?? res?.data ?? res;
      if (!user) throw new Error("Empty response from server");

      setForm({
        email: user.email ?? "",
        passwordHash: user.passwordHash ?? "",
        fullName: user.fullName ?? "",
        phone: user.phone ?? "",
        status: user.status ?? "ACTIVE",
        emailVerified: !!user.emailVerified,
        timezone: user.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
        locale: user.locale ?? (navigator.language || "en-US").replace("-", "_"),
        currency: user.currency ?? user.currencyCode ?? "USD",
        avatarUrl: user.avatarUrl ?? user.avatar_url ?? user.avatar ?? "",
        isActive: typeof user.isActive === "boolean" ? user.isActive : (user.active ?? user.is_active ?? true),
      });
    } catch (err) {
      console.error("Failed to load user", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to load user.";
      setBanner({ type: "error", text: msg });
      setForm(null);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const validate = () => {
    const e = {};
    if (!form.email?.trim()) e.email = "Email is required";
    else if (!emailRx.test(form.email)) e.email = "Please enter a valid email";
    if (!form.passwordHash?.trim()) e.passwordHash = "Password is required";
    if (!form.fullName?.trim()) e.fullName = "Full name is required";
    if (!form.status?.trim()) e.status = "Status is required";
    if (!form.timezone?.trim()) e.timezone = "Timezone is required";
    if (!form.locale?.trim()) e.locale = "Locale is required";
    if (!form.currency?.trim()) e.currency = "Currency is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const onPhoneChange = (val) => {
    setForm((f) => ({ ...f, phone: val || "" }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    setBanner(null);
    try {
      const res = await putUser(id, form);
      const msg = res?.data?.message || "User updated successfully.";
      setBanner({ type: "success", text: msg });
      setTimeout(() => navigate("/users/manage", { state: { flash: msg } }), 600);
    } catch (err) {
      console.error("Failed to update user", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to update user.";
      setBanner({ type: "error", text: msg });
    } finally {
      setBusy(false);
    }
  };

  if (busy && form === null) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Edit User</h1>
        <div className="mt-4">Loading user…</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Edit User{form?.fullName ? ` – ${form.fullName}` : ""}</h1>
        <button onClick={() => navigate("/users/manage")} className="px-3 py-2 rounded border hover:bg-gray-50">
          ← Back to Manage
        </button>
      </div>

      {banner && (
        <div className={`mb-4 p-3 rounded ${banner.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {banner.text}
        </div>
      )}

      {!form ? (
        <div className="text-sm">
          {busy ? "Loading..." : "Unable to load user."}{" "}
          {!busy && (
            <button className="underline text-blue-600" onClick={load}>
              Retry
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium">Email *</label>
            <input name="email" value={form.email} onChange={onChange} className="mt-1 border rounded px-3 py-2" />
            {errors.email && <span className="text-xs text-red-600 mt-1">{errors.email}</span>}
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium">Password *</label>
            <input type="password" name="passwordHash" value={form.passwordHash} onChange={onChange} className="mt-1 border rounded px-3 py-2" />
            {errors.passwordHash && <span className="text-xs text-red-600 mt-1">{errors.passwordHash}</span>}
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium">Full name *</label>
            <input name="fullName" value={form.fullName} onChange={onChange} className="mt-1 border rounded px-3 py-2" />
            {errors.fullName && <span className="text-xs text-red-600 mt-1">{errors.fullName}</span>}
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium">Phone</label>
            <PhoneInput placeholder="Enter phone" value={form.phone} onChange={onPhoneChange} />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium">Status *</label>
            <select name="status" value={form.status} onChange={onChange} className="mt-1 border rounded px-3 py-2">
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
            {errors.status && <span className="text-xs text-red-600 mt-1">{errors.status}</span>}
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" name="emailVerified" checked={!!form.emailVerified} onChange={onChange} />
            <label className="text-sm">Email verified</label>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium">Timezone *</label>
            <select name="timezone" value={form.timezone} onChange={onChange} className="mt-1 border rounded px-3 py-2">
              {timezoneOptions.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
            {errors.timezone && <span className="text-xs text-red-600 mt-1">{errors.timezone}</span>}
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium">Locale *</label>
            <select name="locale" value={form.locale} onChange={onChange} className="mt-1 border rounded px-3 py-2">
              {localeOptions.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label} ({l.value})
                </option>
              ))}
            </select>
            {errors.locale && <span className="text-xs text-red-600 mt-1">{errors.locale}</span>}
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium">Currency *</label>
            <select name="currency" value={form.currency} onChange={onChange} className="mt-1 border rounded px-3 py-2">
              {currencyOptions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            {errors.currency && <span className="text-xs text-red-600 mt-1">{errors.currency}</span>}
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium">Avatar URL</label>
            <input name="avatarUrl" value={form.avatarUrl} onChange={onChange} className="mt-1 border rounded px-3 py-2" />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" name="isActive" checked={!!form.isActive} onChange={onChange} />
            <label className="text-sm">Is Active</label>
          </div>

          <div className="sm:col-span-2 flex gap-3 pt-2">
            <button type="submit" disabled={busy} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
              {busy ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" className="px-4 py-2 rounded border hover:bg-gray-50" onClick={() => navigate("/users/manage")}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
