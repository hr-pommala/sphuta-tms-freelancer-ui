// src/pages/timesheets/NewTimesheet.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { FaRegCalendarAlt } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../api/axios";

function NewTimesheet() {
  const [form, setForm] = useState({
    projectId: "",
    periodStart: null,
    periodEnd: null,
  });
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /* ---------------------------------------
     Load projects using TaskForm style logic
  -----------------------------------------*/
  async function loadProjects() {
    setLoadingProjects(true);
    setFetchError(null);
    try {
      const qs = new URLSearchParams();
      qs.append("active", true);
      qs.append("page", 0);
      qs.append("size", 200);
      const url = `/projects/projects?${qs.toString()}`;

      const res = await api.get(url);
      const candidate = res?.data?.data?.content ?? res?.data?.data ?? res?.data ?? res;
      const list = Array.isArray(candidate) ? candidate : [];
      const normalized = list.map((raw) => ({
        id: raw.id ?? raw.projectId ?? raw.timesheetId,
        name: raw.projectName ?? raw.name ?? raw.title ?? raw.code ?? `#${raw.id ?? raw.projectId}`,
        code: raw.code ?? raw.projectCode ?? "",
        hourlyRate: raw.hourlyRate ?? raw.rate ?? raw.hourly ?? null,
        startDate: raw.startDate ?? raw.periodStart ?? null,
        endDate: raw.endDate ?? raw.periodEnd ?? null,
        isActive: raw.isActive ?? raw.active ?? true,
        client: raw.client ?? raw.clientDto ?? null,
        __raw: raw,
      }));
      setProjects(normalized);
    } catch (err) {
      console.error("[NewTimesheet] failed to load projects:", err);
      setFetchError(err?.message || "Failed to load projects");
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  const selectedProject = useMemo(
    () => projects.find((p) => String(p.id) === String(form.projectId)),
    [projects, form.projectId]
  );

  /* ---------------------------------------
     Helpers
  -----------------------------------------*/
  const formatDate = (date) => {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const validate = () => {
    const newErrors = {};
    if (!form.projectId) newErrors.projectId = "Project is required";
    if (!form.periodStart) newErrors.periodStart = "Period Start is required";
    if (!form.periodEnd) newErrors.periodEnd = "Period End is required";
    if (form.periodStart && form.periodEnd && form.periodEnd < form.periodStart) {
      newErrors.periodEnd = "Period End must be after Period Start";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
    setSuccess("");
  };

  /* ---------------------------------------
     Submit
  -----------------------------------------*/
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError("");
    setSuccess("");

    const payload = {
      projectId: parseInt(form.projectId, 10),
      periodStart: formatDate(form.periodStart),
      periodEnd: formatDate(form.periodEnd),
    };

    try {
      await api.post("/timesheets", payload);
      setSuccess("✅ Timesheet created successfully!");
      setTimeout(() => navigate("/timesheets"), 700);
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to create timesheet";
      if (msg.includes("already exists")) {
        setApiError("⚠️ A timesheet already exists for this project and period.");
      } else {
        setApiError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({ projectId: "", periodStart: null, periodEnd: null });
    navigate("/timesheets");
  };

  const CustomDateInput = ({ value, onClick, placeholder }) => (
    <div className="relative w-full">
      <input
        type="text"
        readOnly
        value={value}
        onClick={onClick}
        placeholder={placeholder}
        className="w-full border px-3 py-2 rounded pr-10 cursor-pointer bg-white"
      />
      <FaRegCalendarAlt
        onClick={onClick}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer hover:text-blue-500"
      />
    </div>
  );

  /* ---------------------------------------
     Render
  -----------------------------------------*/
  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Create New Timesheet</h2>

      {apiError && (
        <p className="mb-3 text-red-600 font-medium bg-red-100 p-2 rounded">
          {apiError}
        </p>
      )}
      {success && (
        <p className="mb-3 text-green-700 font-medium bg-green-100 p-2 rounded">
          {success}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* --- Project Dropdown --- */}
        <div>
          <label className="block mb-1 font-medium">Project</label>

          {loadingProjects ? (
            <p className="text-gray-500 text-sm">Loading projects…</p>
          ) : fetchError ? (
            <div className="text-red-600 text-sm mt-1">
              Failed to load projects: {fetchError}
              <button
                type="button"
                onClick={loadProjects}
                className="ml-2 px-2 py-1 text-xs border rounded bg-gray-100"
              >
                Retry
              </button>
            </div>
          ) : projects.length === 0 ? (
            <p className="text-gray-500 text-sm mt-1">No projects found.</p>
          ) : (
            <>
              <select
                name="projectId"
                value={form.projectId}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded focus:ring focus:ring-blue-300 bg-white"
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </>
          )}

          {errors.projectId && (
            <p className="text-red-600 text-sm mt-1">{errors.projectId}</p>
          )}
        </div>

        {/* --- Period Start --- */}
        <div>
          <label className="block mb-1 font-medium">Period Start</label>
          <DatePicker
            selected={form.periodStart}
            onChange={(date) =>
              setForm((prev) => ({ ...prev, periodStart: date }))
            }
            dateFormat="yyyy-MM-dd"
            placeholderText="YYYY-MM-DD"
            customInput={<CustomDateInput placeholder="YYYY-MM-DD" />}
            maxDate={form.periodEnd || null}
          />
          {errors.periodStart && (
            <p className="text-red-600 text-sm mt-1">{errors.periodStart}</p>
          )}
        </div>

        {/* --- Period End --- */}
        <div>
          <label className="block mb-1 font-medium">Period End</label>
          <DatePicker
            selected={form.periodEnd}
            onChange={(date) =>
              setForm((prev) => ({ ...prev, periodEnd: date }))
            }
            dateFormat="yyyy-MM-dd"
            placeholderText="YYYY-MM-DD"
            customInput={<CustomDateInput placeholder="YYYY-MM-DD" />}
            minDate={form.periodStart || null}
          />
          {errors.periodEnd && (
            <p className="text-red-600 text-sm mt-1">{errors.periodEnd}</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Creating..." : "Create"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewTimesheet;
