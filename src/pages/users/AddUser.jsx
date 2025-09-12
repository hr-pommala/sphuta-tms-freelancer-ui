// src/pages/Users/AddUser.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import moment from "moment-timezone";
import locales from "locale-codes"; // npm i locale-codes
import currencyCodes from "currency-codes"; // npm i currency-codes

import { createUser } from "../../api/users";

const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getDefaultTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};

const toLocaleTag = (navLang) => {
  // convert 'en-US' -> 'en_US' for your backend's expected format
  if (!navLang) return "en_US";
  return navLang.replace("-", "_");
};

const buildLocaleOptions = () => {
  // locale-codes exports arrays; use unique tag list (tag looks like 'en_US', name present)
  // Fallback: provide a few common locales if package not present
  try {
    const all = locales.all || [];
    // map to { value: 'en_US', label: 'English (United States)' } and sort
    const picked = all
      .map((l) => ({ value: l.tag, label: l.name || l.tag }))
      .filter(Boolean);
    // ensure unique
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
    // currency-codes returns objects with 'code' and 'currency'
    const list = currencyCodes.codes ? currencyCodes.codes() : currencyCodes; // support different exports
    // However currency-codes package also supports currencyCodes.data; so finally:
    const all = (currencyCodes.codes ? currencyCodes.codes() : (currencyCodes && currencyCodes.slice ? currencyCodes : []));
    // We'll fallback to currency-codes package main export: currencyCodes.codes()
    const dedup = new Set();
    const out = [];
    try {
      const codes = currencyCodes.codes();
      codes.forEach((c) => {
        if (!dedup.has(c)) {
          dedup.add(c);
          out.push({ value: c, label: c });
        }
      });
      return out;
    } catch {
      return [
        { value: "USD", label: "USD" },
        { value: "INR", label: "INR" },
        { value: "EUR", label: "EUR" },
      ];
    }
  } catch {
    return [
      { value: "USD", label: "USD" },
      { value: "INR", label: "INR" },
      { value: "EUR", label: "EUR" },
    ];
  }
};

const initialFormFactory = () => ({
  email: "",
  passwordHash: "",
  fullName: "",
  phone: "",
  status: "ACTIVE",
  emailVerified: false,
  timezone: getDefaultTimezone(),
  locale: toLocaleTag(navigator.language || "en-US"),
  currency: "USD",
  avatarUrl: "",
  isActive: true,
});

export default function AddUser() {
  const [form, setForm] = useState(initialFormFactory());
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState(null); // {type:'success'|'error', text:string}
  const navigate = useNavigate();

  const [localeOptions] = useState(buildLocaleOptions);
  const [timezoneOptions] = useState(buildTimezoneOptions);
  const [currencyOptions] = useState(buildCurrencyOptions);

  useEffect(() => {
    // If default timezone isn't in list, fallback to UTC
    if (!timezoneOptions.includes(form.timezone)) {
      setForm((f) => ({ ...f, timezone: "UTC" }));
    }
    // If locale not present, leave as-is (backend can accept)
    // If currency not present, leave
    // no other side effects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const payload = {
        ...form,
      };
      const resp = await createUser(payload);
      const message = resp?.data?.message || "User created successfully.";
      setBanner({ type: "success", text: message });

      // reset the form right away
      setForm(initialFormFactory());
      setErrors({});

      // navigate to Manage after a tiny pause so user sees the banner and UX feels natural
      setTimeout(() => navigate("/users/manage", { state: { flash: message } }), 700);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to create user.";
      setBanner({ type: "error", text: msg });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-semibold mb-4">Add User</h1>

      {banner && (
        <div
          className={`mb-4 p-3 rounded ${
            banner.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {banner.text}
        </div>
      )}

      <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Email */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Email *</label>
          <input name="email" value={form.email} onChange={onChange} className="mt-1 border rounded px-3 py-2" placeholder="user@example.com" />
          {errors.email && <span className="text-xs text-red-600 mt-1">{errors.email}</span>}
        </div>

        {/* Password */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Password *</label>
          <input type="password" name="passwordHash" value={form.passwordHash} onChange={onChange} className="mt-1 border rounded px-3 py-2" placeholder="••••••••" />
          {errors.passwordHash && <span className="text-xs text-red-600 mt-1">{errors.passwordHash}</span>}
        </div>

        {/* Full name */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Full name *</label>
          <input name="fullName" value={form.fullName} onChange={onChange} className="mt-1 border rounded px-3 py-2" placeholder="Jane Doe" />
          {errors.fullName && <span className="text-xs text-red-600 mt-1">{errors.fullName}</span>}
        </div>

        {/* Phone (country-aware) */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Phone</label>
          <PhoneInput placeholder="Enter phone" value={form.phone} onChange={onPhoneChange} defaultCountry={form.timezone?.startsWith("Asia") ? "IN" : undefined} />
        </div>

        {/* Status */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Status *</label>
          <select name="status" value={form.status} onChange={onChange} className="mt-1 border rounded px-3 py-2">
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
          {errors.status && <span className="text-xs text-red-600 mt-1">{errors.status}</span>}
        </div>

        {/* Email verified */}
        <div className="flex items-center gap-2 pt-6">
          <input type="checkbox" name="emailVerified" checked={form.emailVerified} onChange={onChange} />
          <label className="text-sm">Email verified</label>
        </div>

        {/* Timezone select */}
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

        {/* Locale select */}
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

        {/* Currency select */}
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

        {/* Avatar URL */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Avatar URL</label>
          <input name="avatarUrl" value={form.avatarUrl} onChange={onChange} className="mt-1 border rounded px-3 py-2" placeholder="https://..." />
        </div>

        {/* Is Active */}
        <div className="flex items-center gap-2 pt-6">
          <input type="checkbox" name="isActive" checked={!!form.isActive} onChange={onChange} />
          <label className="text-sm">Is Active</label>
        </div>

        <div className="sm:col-span-2 flex gap-3 pt-2">
          <button type="submit" disabled={busy} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60">
            {busy ? "Saving..." : "Create User"}
          </button>
          <button type="button" className="px-4 py-2 rounded border" onClick={() => navigate("/users/manage")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
