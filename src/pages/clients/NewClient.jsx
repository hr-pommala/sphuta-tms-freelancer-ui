// NewClient.jsx  (replace your existing file with this)
import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios"; // <-- use central api instance
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = `${import.meta.env.VITE_API_BASE}/clients`;
const USERS_API_PATH = "/users"; // call via `api`, not absolute URL

/** Cascading: state → city → ZIP */
const STATES = [
  { code: "TX", label: "Texas" },
  { code: "CA", label: "California" },
  { code: "NY", label: "New York" },
];
const CITIES_BY_STATE = {
  TX: ["Austin", "Dallas", "Houston"],
  CA: ["Los Angeles", "San Francisco", "San Diego"],
  NY: ["New York City", "Buffalo", "Rochester"],
};
const ZIPS_BY_CITY = {
  Austin: ["78701", "78702", "78703"],
  Dallas: ["75201", "75202", "75203"],
  Houston: ["77001", "77002", "77003", "77004"],
  "Los Angeles": ["90001", "90002", "90003"],
  "San Francisco": ["94101", "94102", "94103"],
  "San Diego": ["92101", "92102", "92103"],
  "New York City": ["10001", "10002", "10003"],
  Buffalo: ["14201", "14202", "14203"],
  Rochester: ["14602", "14604", "14605"],
};

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "hi", label: "Hindi" },
  { code: "fr", label: "French" },
];
const CURRENCIES = [
  { code: "USD", label: "US Dollar" },
  { code: "INR", label: "Indian Rupee" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British Pound" },
];

const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const phoneRegex = /^[+]?([0-9 ()-]{6,20})$/;

/** Normalize payload for the backend */
const sanitizePayload = (data) => {
  const trim = (v) => (typeof v === "string" ? v.trim() : v);

  let firstName = trim(data.firstName);
  let lastName = trim(data.lastName);
  if ((!firstName || firstName === "") && (!lastName || lastName === "")) {
    firstName = trim(data.companyName) || "Client";
  }

  return {
    // IMPORTANT: userId must be an integer for your backend
    userId: data.userId == null ? null : Number(data.userId),

    firstName,
    lastName: trim(lastName) || null,
    companyName: trim(data.companyName) || null,
    email: (trim(data.email) || "").toLowerCase(),
    mobilePhone: trim(data.mobilePhone) || null,
    businessPhone: trim(data.businessPhone) || null,
    addressLine1: trim(data.addressLine1) || null,
    addressLine2: trim(data.addressLine2) || null,
    city: trim(data.city) || null,
    state: trim(data.state) || null,
    postalCode: trim(data.postalCode) || null,
    countryCode: "US",

    sendReminders: !!data.sendReminders,
    chargeLateFees: !!data.chargeLateFees,
    allowInvoiceAttachments: !!data.allowInvoiceAttachments,
    isActive: data.isActive !== false,

    lateFeePercent:
      data.lateFeePercent === "" || data.lateFeePercent == null
        ? null
        : Number(data.lateFeePercent),

    currencyCode: (data.currencyCode || "USD").toUpperCase(),
    language: (data.language || "en").trim(),
  };
};

const NewClient = () => {
  const navigate = useNavigate();
  const { id: idParam } = useParams();
  const editId = idParam ? Number(idParam) : null;
  const isEdit = Boolean(editId);

  const [formData, setFormData] = useState({
    userId: null, // <-- new
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    mobilePhone: "",
    businessPhone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    sendReminders: false,
    chargeLateFees: false,
    lateFeePercent: null,
    currencyCode: "USD",
    language: "en",
    allowInvoiceAttachments: false,
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // users list for the select
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState(null);

  // settings modals
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const [showLateFeesModal, setShowLateFeesModal] = useState(false);
  const [showLateFeePercentModal, setShowLateFeePercentModal] = useState(false);
  const [showCurrencyLangModal, setShowCurrencyLangModal] = useState(false);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState(null);

  // ESC to close modals
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setShowRemindersModal(false);
        setShowLateFeesModal(false);
        setShowLateFeePercentModal(false);
        setShowCurrencyLangModal(false);
        setShowAttachModal(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // load users for the select
  useEffect(() => {
    let alive = true;
    const ctrl = new AbortController();
    setLoadingUsers(true);

    (async () => {
      try {
        // Use the central `api` instance and request the users endpoint with params.
        // Backend frequently returns paginated responses like { data: { content: [...] } }
        const res = await api.get(USERS_API_PATH, {
          params: { page: 0, size: 200 },
          signal: ctrl.signal,
        });

        // prefer paginated content -> fallback to other shapes
        const list =
          res?.data?.data?.content ??
          res?.data?.data ??
          res?.data ??
          [];

        if (alive) {
          setUsers(Array.isArray(list) ? list : []);
          setUsersError(null);
        }
      } catch (e) {
        if (alive) {
          setUsersError("Failed to load users");
          setUsers([]);
        }
      } finally {
        if (alive) setLoadingUsers(false);
      }
    })();

    return () => {
      alive = false;
      ctrl.abort();
    };
  }, []);

  // Prefill for edit mode
  useEffect(() => {
    if (!isEdit) return;
    const ctrl = new AbortController();
    let alive = true;

    const fill = (dto = {}) => {
      let f = dto.firstName ?? "";
      let l = dto.lastName ?? "";
      if (!f && !l && dto.name) {
        const parts = String(dto.name).trim().split(/\s+/);
        l = parts.pop() || "";
        f = parts.join(" ");
      }
      const stateCode =
        dto.state && dto.state.length === 2
          ? dto.state
          : (STATES.find((s) => s.label === dto.state)?.code || "");

      const filled = {
        userId: dto.userId ?? null, // <-- prefill userId if provided by DTO
        firstName: f || "",
        lastName: l || "",
        companyName: dto.companyName || "",
        email: dto.email || "",
        mobilePhone: dto.mobilePhone || "",
        businessPhone: dto.businessPhone || "",
        addressLine1: dto.addressLine1 || "",
        addressLine2: dto.addressLine2 || "",
        city: dto.city || "",
        state: stateCode || "",
        postalCode: dto.postalCode || "",
        sendReminders: !!dto.sendReminders,
        chargeLateFees: !!dto.chargeLateFees,
        lateFeePercent: dto.lateFeePercent ?? null,
        currencyCode: dto.currencyCode || "USD",
        language: dto.language || "en",
        allowInvoiceAttachments: !!dto.allowInvoiceAttachments,
        isActive: dto.isActive !== false,
      };
      if (alive) setFormData(filled);
    };

    (async () => {
      try {
        const res = await api.get(`${API_BASE}/${editId}`, { signal: ctrl.signal });
        const dto = res?.data?.data ?? res?.data;
        if (dto) {
          fill(dto);
          return;
        }
      } catch (err) {
        // fallback to listing if single get failed
      }

      try {
        const [a, b] = await Promise.all([
          api.get(API_BASE, { params: { active: true, page: 0, size: 10000 }, signal: ctrl.signal }),
          api.get(API_BASE, { params: { active: false, page: 0, size: 10000 }, signal: ctrl.signal }),
        ]);
        const combined = [...(a.data?.data || []), ...(b.data?.data || [])];
        const dto = combined.find((x) => x.id === editId);
        if (!dto) throw new Error("not found");
        fill(dto);
      } catch (e) {
        if (alive) setErrors({ api: "Client not found or not accessible." });
      }
    })();

    return () => {
      alive = false;
      ctrl.abort();
    };
  }, [isEdit, editId]);

  // cascading options
  const cities = useMemo(() => (formData.state ? CITIES_BY_STATE[formData.state] || [] : []), [formData.state]);
  const zips = useMemo(() => (formData.city ? ZIPS_BY_CITY[formData.city] || [] : []), [formData.city]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "lateFeePercent") {
      setFormData((p) => ({ ...p, lateFeePercent: value === "" ? null : Number(value) }));
      setErrors((prev) => ({ ...prev, lateFeePercent: undefined }));
      return;
    }
    if (name === "state") {
      setFormData((p) => ({ ...p, state: value, city: "", postalCode: "" }));
      setErrors((prev) => ({ ...prev, state: undefined }));
      return;
    }
    if (name === "city") {
      setFormData((p) => ({ ...p, city: value, postalCode: "" }));
      setErrors((prev) => ({ ...prev, city: undefined }));
      return;
    }

    // userId select will be string; convert to number if non-empty
    if (name === "userId") {
      const val = value === "" ? null : Number(value);
      setFormData((p) => ({ ...p, userId: val }));
      setErrors((prev) => ({ ...prev, userId: undefined }));
      return;
    }

    setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // check if email already exists for the same company (exclude current editId)
  const checkEmailExists = async (email, companyName) => {
    if (!email || !emailRegex.test(email) || !companyName || !companyName.trim()) return false;
    try {
      const [act, arc] = await Promise.all([
        api.get(API_BASE, { params: { active: true, search: email, page: 0, size: 20 } }),
        api.get(API_BASE, { params: { active: false, search: email, page: 0, size: 20 } }),
      ]);
      const pick = (r) => r?.data?.data ?? [];
      const found = [...pick(act), ...pick(arc)].some(
        (c) =>
          (c.email || "").toLowerCase() === email.toLowerCase() &&
          (c.companyName || "").toLowerCase() === (companyName || "").toLowerCase() &&
          c.id !== editId
      );
      return found;
    } catch {
      return false;
    }
  };

  const validate = async () => {
    const errs = {};

    // require userId now
    if (!formData.userId) {
      errs.userId = "Owner (user) is required";
    }

    if (!formData.companyName?.trim()) {
      errs.companyName = "Company name is required";
    }

    if (!formData.email?.trim()) errs.email = "Email required";
    else if (!emailRegex.test(formData.email)) errs.email = "Invalid email format";
    else if (await checkEmailExists(formData.email, formData.companyName)) errs.email = "Email already exists for this company";

    if (formData.mobilePhone && !phoneRegex.test(formData.mobilePhone))
      errs.mobilePhone = "Phone must be E.164-like (+, digits, spaces, () or -)";
    if (formData.businessPhone && !phoneRegex.test(formData.businessPhone))
      errs.businessPhone = "Phone must be E.164-like";

    if (!formData.state?.trim()) errs.state = "State required";
    if (!formData.city?.trim()) errs.city = "City required";
    if (!formData.postalCode?.trim()) errs.postalCode = "ZIP required";

    const n = formData.lateFeePercent;
    if (n !== null && (Number.isNaN(n) || n < 0 || n > 100)) {
      errs.lateFeePercent = "Late fee must be between 0 and 100";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const ok = await validate();
    if (!ok) return;

    try {
      setSubmitting(true);
      const payload = sanitizePayload(formData);
      if (isEdit) {
        await api.put(`${API_BASE}/${editId}`, payload, { headers: { "Content-Type": "application/json" } });
      } else {
        await api.post(API_BASE, payload, { headers: { "Content-Type": "application/json" } });
      }
      navigate("/clients", { replace: true });
    } catch (err) {
      const status = err.response?.status;
      const raw =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.errors?.map?.((x) => `${x.field}: ${x.message}`)?.join("\n") ||
        err.message ||
        "Validation failed";
      const lower = String(raw).toLowerCase();
      setErrors((prev) => ({
        ...prev,
        api: raw,
        ...(status === 409 || lower.includes("unique") || lower.includes("already in use")
          ? { email: "Email already exists for this company" }
          : {}),
      }));
      console.error("Save client failed:", err.response?.data || err);
    } finally {
      setSubmitting(false);
    }
  };

  /** simple modal wrapper */
  const Backdrop = ({ onClose, children }) => (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3"
      onClick={onClose}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );

  // Modals (unchanged)...
  const RemindersModal = () => (
    <Backdrop onClose={() => setShowRemindersModal(false)}>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-center mb-3">Send Payment Reminders</h3>
        <p className="text-center text-gray-600 mb-4">Automatically send payment reminders for this client’s invoices.</p>
        <label className="flex items-center gap-2 mb-2">
          <input type="checkbox" checked={formData.sendReminders}
                 onChange={(e) => setFormData((p) => ({ ...p, sendReminders: e.target.checked }))} />
          <span>Enable reminders for this client</span>
        </label>
        <p className="text-xs text-gray-500 mb-6">info  Changes will also apply to any new invoices</p>
        <div className="flex justify-between">
          <button className="px-4 py-2" onClick={() => setShowRemindersModal(false)}>Cancel</button>
          <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={() => setShowRemindersModal(false)}>Done</button>
        </div>
      </div>
    </Backdrop>
  );

  const LateFeesModal = () => (
    <Backdrop onClose={() => setShowLateFeesModal(false)}>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-center mb-3">Charge Late Fees</h3>
        <p className="text-center text-gray-600 mb-4">Automatically add late fees to this client’s overdue invoices.</p>
        <label className="flex items-center gap-2 mb-2">
          <input type="checkbox" checked={formData.chargeLateFees}
                 onChange={(e) => setFormData((p) => ({ ...p, chargeLateFees: e.target.checked }))} />
          <span>Enable late fees for this client</span>
        </label>
        <p className="text-xs text-gray-500 mb-6">info  Changes will also apply to any new invoices</p>
        <div className="flex justify-between">
          <button className="px-4 py-2" onClick={() => setShowLateFeesModal(false)}>Cancel</button>
          <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={() => setShowLateFeesModal(false)}>Done</button>
        </div>
      </div>
    </Backdrop>
  );

  const LateFeePercentModal = () => (
    <Backdrop onClose={() => setShowLateFeePercentModal(false)}>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-center mb-3">Late Fee Percent</h3>
        <p className="text-center text-gray-600 mb-4">Enter a value between 0 and 100.</p>
        <input
          type="number" min={0} max={100} step="0.1"
          name="lateFeePercent"
          value={formData.lateFeePercent ?? ""}
          onChange={handleChange}
          placeholder="e.g., 2.5"
          className="w-full p-2 border rounded mb-1"
        />
        {errors.lateFeePercent && <p className="text-xs text-red-600 mb-2">{errors.lateFeePercent}</p>}
        <div className="flex justify-between">
          <button className="px-4 py-2" onClick={() => setShowLateFeePercentModal(false)}>Cancel</button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={() => {
              const n = formData.lateFeePercent;
              if (n !== null && (Number.isNaN(n) || n < 0 || n > 100)) {
                setErrors((e) => ({ ...e, lateFeePercent: "0–100 only" }));
                return;
              }
              setShowLateFeePercentModal(false);
            }}
          >
            Done
          </button>
        </div>
      </div>
    </Backdrop>
  );

  const CurrencyLangModal = () => (
    <Backdrop onClose={() => setShowCurrencyLangModal(false)}>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-center mb-4">Currency & Language</h3>
        <label className="block text-sm font-medium mb-1">Language</label>
        <select name="language" value={formData.language} onChange={handleChange} className="w-full p-2 border rounded mb-4">
          {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label} ({l.code})</option>)}
        </select>
        <label className="block text-sm font-medium mb-1">Currency</label>
        <select name="currencyCode" value={formData.currencyCode} onChange={handleChange} className="w-full p-2 border rounded mb-6">
          {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.label}</option>)}
        </select>
        <div className="flex justify-between">
          <button className="px-4 py-2" onClick={() => setShowCurrencyLangModal(false)}>Cancel</button>
          <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={() => setShowCurrencyLangModal(false)}>Done</button>
        </div>
      </div>
    </Backdrop>
  );

  const AttachmentsModal = () => (
    <Backdrop onClose={() => setShowAttachModal(false)}>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-center mb-3">Invoice Attachments</h3>
        <p className="text-center text-gray-600 mb-4">This section is for attaching invoice-related files.</p>
        <div className="mb-4 text-center">
          <input type="file" onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)} />
          {attachmentFile && (
            <p className="mt-2 text-sm text-gray-600">Selected: <span className="font-medium">{attachmentFile.name}</span></p>
          )}
        </div>
        <label className="inline-flex items-center gap-2 mb-6">
          <input type="checkbox" checked={formData.allowInvoiceAttachments} onChange={(e) => setFormData((p) => ({ ...p, allowInvoiceAttachments: e.target.checked }))} />
          <span>Enable attachments for this client</span>
        </label>
        <div className="flex justify-between">
          <button className="px-4 py-2" onClick={() => setShowAttachModal(false)}>Cancel</button>
          <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={() => setShowAttachModal(false)}>Done</button>
        </div>
      </div>
    </Backdrop>
  );

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
        <h1 className="text-2xl font-bold mb-2">{isEdit ? "Edit Client" : "New Client"}</h1>
        <p className="text-sm text-gray-500 mb-4">Required fields are marked with *</p>

        {errors.api && (
          <div className="mb-4 p-3 rounded border border-red-300 bg-red-50 text-red-700">
            {errors.api}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left form */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* NEW: User select */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Owner (User) *</label>
              <select
                name="userId"
                value={formData.userId ?? ""}
                onChange={handleChange}
                className={`p-2 border rounded w-full ${errors.userId ? "border-red-500" : ""}`}
              >
                <option value="">Select owner</option>
                {loadingUsers && <option value="">Loading users...</option>}
                {!loadingUsers && users.length === 0 && <option value="">No users found</option>}
                {users.map((u) => (
                  // adjust label if user object shape differs (e.g., email + fullName)
                  <option key={u.id} value={u.id}>
                    {u.fullName ?? u.email ?? `User ${u.id}`}
                  </option>
                ))}
              </select>
              {errors.userId && <p className="text-xs text-red-600 mt-1">{errors.userId}</p>}
              {usersError && <p className="text-xs text-yellow-700 mt-1">{usersError}</p>}
            </div>

            <input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} className="p-2 border rounded" />
            <input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className="p-2 border rounded" />

            <div className="sm:col-span-2">
              <input
                name="companyName" placeholder="Company Name *" value={formData.companyName}
                onChange={handleChange}
                className={`p-2 border rounded w-full ${errors.companyName ? "border-red-500" : ""}`}
              />
              {errors.companyName && <p className="text-xs text-red-600 mt-1">{errors.companyName}</p>}
            </div>

            <div className="sm:col-span-2">
              <input
                type="email" name="email" placeholder="Email *" value={formData.email}
                onChange={handleChange}
                onBlur={async () => {
                  if (!formData.email || !formData.companyName) return;
                  const taken = await checkEmailExists(formData.email, formData.companyName);
                  if (taken) setErrors((e) => ({ ...e, email: "Email already exists for this company" }));
                }}
                className={`p-2 border rounded w-full ${errors.email ? "border-red-500" : ""}`}
              />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>

            <input name="mobilePhone" placeholder="Mobile Phone" value={formData.mobilePhone} onChange={handleChange} className={`p-2 border rounded ${errors.mobilePhone ? "border-red-500" : ""}`} />
            <input name="businessPhone" placeholder="Business Phone" value={formData.businessPhone} onChange={handleChange} className={`p-2 border rounded ${errors.businessPhone ? "border-red-500" : ""}`} />

            <div className="sm:col-span-2">
              <input name="addressLine1" placeholder="Address Line 1 *" value={formData.addressLine1} onChange={handleChange} className="p-2 border rounded w-full" />
            </div>
            <div className="sm:col-span-2">
              <input name="addressLine2" placeholder="Address Line 2" value={formData.addressLine2} onChange={handleChange} className="p-2 border rounded w-full" />
            </div>

            {/* Cascading selects */}
            <div>
              <label className="block text-sm font-medium mb-1">State *</label>
              <select name="state" value={formData.state} onChange={handleChange} className={`p-2 border rounded w-full ${errors.state ? "border-red-500" : ""}`}>
                <option value="">Select State</option>
                {STATES.map((s) => <option key={s.code} value={s.code}>{s.label}</option>)}
              </select>
              {errors.state && <p className="text-xs text-red-600 mt-1">{errors.state}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">City *</label>
              <select name="city" value={formData.city} onChange={handleChange} disabled={!formData.state} className={`p-2 border rounded w-full ${errors.city ? "border-red-500" : ""}`}>
                <option value="">{formData.state ? "Select City" : "Select state first"}</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">ZIP *</label>
              <select name="postalCode" value={formData.postalCode} onChange={handleChange} disabled={!formData.city} className={`p-2 border rounded w-full ${errors.postalCode ? "border-red-500" : ""}`}>
                <option value="">{formData.city ? "Select ZIP" : "Select city first"}</option>
                {zips.map((z) => <option key={z} value={z}>{z}</option>)}
              </select>
              {errors.postalCode && <p className="text-xs text-red-600 mt-1">{errors.postalCode}</p>}
            </div>

            <div className="sm:col-span-2">
              <button type="submit" disabled={submitting} className={`w-full px-6 py-2 text-white rounded ${submitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
                {submitting ? (isEdit ? "Updating..." : "Saving...") : (isEdit ? "Update Client" : "Save Client")}
              </button>
            </div>
          </div>

          {/* Right settings card */}
          <div className="border rounded-lg shadow-sm p-4 bg-gray-50 h-max">
            <h2 className="font-semibold mb-3">Client Settings</h2>

            <button type="button" className="w-full flex items-center justify-between py-2 border-b hover:bg-white" onClick={() => setShowRemindersModal(true)}>
              <span>🔔 Send Payment Reminders</span>
              <span className="text-sm">{formData.sendReminders ? "Yes" : "No"}</span>
            </button>

            <button type="button" className="w-full flex items-center justify-between py-2 border-b hover:bg-white" onClick={() => setShowLateFeesModal(true)}>
              <span>💲 Charge Late Fees</span>
              <span className="text-sm">{formData.chargeLateFees ? "Yes" : "No"}</span>
            </button>

            <button type="button" className="w-full flex items-center justify-between py-2 border-b hover:bg-white" onClick={() => setShowLateFeePercentModal(true)}>
              <span>📊 Late Fee Percent</span>
              <span className="text-sm">{formData.lateFeePercent == null ? "Not Set" : formData.lateFeePercent}</span>
            </button>

            <button type="button" className="w-full flex items-center justify-between py-2 border-b hover:bg-white" onClick={() => setShowCurrencyLangModal(true)}>
              <span>🔤 Currency & Language</span>
              <span className="text-sm">{formData.currencyCode}, {formData.language}</span>
            </button>

            <button type="button" className="w-full flex items-center justify-between py-2 hover:bg-white" onClick={() => setShowAttachModal(true)}>
              <span>📎 Invoice Attachments</span>
              <span className="text-sm">{formData.allowInvoiceAttachments ? "Yes" : "No"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Modals */}
      {showRemindersModal && <RemindersModal />}
      {showLateFeesModal && <LateFeesModal />}
      {showLateFeePercentModal && <LateFeePercentModal />}
      {showCurrencyLangModal && <CurrencyLangModal />}
      {showAttachModal && <AttachmentsModal />}
    </div>
  );
};

export default NewClient;
