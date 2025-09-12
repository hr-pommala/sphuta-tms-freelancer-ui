// src/pages/Timesheets/NewTimesheet.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { FaRegCalendarAlt } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import axiosClient from "../../api/axios";

function NewTimesheet() {
  const [form, setForm] = useState({
    projectId: "",
    // use Date objects for the date pickers
    periodStart: null,
    periodEnd: null,
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formatDate = (date) => {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const validate = () => {
    const newErrors = {};

    if (!form.projectId) newErrors.projectId = "Project ID is required";
    if (!form.periodStart) newErrors.periodStart = "Period Start is required";
    if (!form.periodEnd) newErrors.periodEnd = "Period End is required";

    // If both dates present, ensure end >= start
    if (form.periodStart && form.periodEnd) {
      // strip time portion by using midnight for comparison
      const start = new Date(form.periodStart.getFullYear(), form.periodStart.getMonth(), form.periodStart.getDate());
      const end = new Date(form.periodEnd.getFullYear(), form.periodEnd.getMonth(), form.periodEnd.getDate());
      if (end < start) {
        newErrors.periodEnd = "Period End must be greater than or equal to Period Start";
      }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccess("");

    if (!validate()) return;

    setLoading(true);

    const payload = {
      projectId: parseInt(form.projectId, 10),
      periodStart: formatDate(form.periodStart),
      periodEnd: formatDate(form.periodEnd),
    };

    try {
      const res = await axiosClient.post("/timesheets", payload);
      // If using wrapped response: check res.data.data etc — adjust if needed.
      setSuccess("✅ Timesheet created successfully!");
      // small delay for UX then navigate to list
      setTimeout(() => {
        navigate("/timesheets");
      }, 600);
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to create timesheet";
      if (msg.includes("already exists")) {
        setApiError("⚠️ A timesheet already exists for this project and period.");
      } else if (msg.includes("periodEnd must be")) {
        setApiError(
          "⚠️ Period End date must be greater than or equal to Period Start date."
        );
      } else {
        setApiError(msg);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({ projectId: "", periodStart: null, periodEnd: null });
    navigate("/timesheets");
  };

  // Custom Input for DatePicker with calendar icon
  const CustomDateInput = ({ value, onClick, placeholder }) => (
    <div className="relative w-full">
      <input
        type="text"
        readOnly
        value={value}
        onClick={onClick}
        placeholder={placeholder}
        className="w-full border px-3 py-2 rounded focus:ring focus:ring-blue-300 pr-10 cursor-pointer bg-white"
      />
      <FaRegCalendarAlt
        onClick={onClick}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer hover:text-blue-500"
      />
    </div>
  );

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
        <div>
          <label className="block mb-1 font-medium">Project ID</label>
          <input
            type="number"
            name="projectId"
            value={form.projectId}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:ring focus:ring-blue-300"
          />
          {errors.projectId && (
            <p className="text-red-600 text-sm mt-1">{errors.projectId}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Period Start</label>
          <DatePicker
            selected={form.periodStart}
            onChange={(date) => setForm((prev) => ({ ...prev, periodStart: date }))}
            dateFormat="yyyy-MM-dd"
            placeholderText="YYYY-MM-DD"
            customInput={<CustomDateInput placeholder="YYYY-MM-DD" />}
            maxDate={form.periodEnd || null}
          />
          {errors.periodStart && (
            <p className="text-red-600 text-sm mt-1">{errors.periodStart}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Period End</label>
          <DatePicker
            selected={form.periodEnd}
            onChange={(date) => setForm((prev) => ({ ...prev, periodEnd: date }))}
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
