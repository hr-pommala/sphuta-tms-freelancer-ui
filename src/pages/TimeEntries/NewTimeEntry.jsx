// src/pages/TimeEntries/NewTimeEntry.jsx
import React, { useState, forwardRef, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import { FaRegCalendarAlt } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import axiosClient from "../../api/axios";

function NewTimeEntry() {
  const timerRef = useRef(null);

  const [form, setForm] = useState({
    timesheetId: "",
    entryDate: null,
    description: "",
    hours: "",
    rateAtEntry: "",
    taskId: "", // optional: allow user to pass task id
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const formatDate = (date) => {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const validate = () => {
    const newErrors = {};
    if (!form.timesheetId && form.timesheetId !== 0) newErrors.timesheetId = "Timesheet ID is required";
    if (!form.entryDate) newErrors.entryDate = "Entry Date is required";
    if (!form.description) newErrors.description = "Description is required";
    if (form.hours === "" || form.hours === null) newErrors.hours = "Hours are required";
    if (form.hours !== "" && Number.isNaN(parseFloat(form.hours))) newErrors.hours = "Hours must be a number";
    if (form.hours && parseFloat(form.hours) <= 0) {
      newErrors.hours = "Hours must be greater than 0";
    }
    if (form.rateAtEntry !== "" && !Number.isNaN(parseFloat(form.rateAtEntry)) && parseFloat(form.rateAtEntry) <= 0) {
      newErrors.rateAtEntry = "Rate must be greater than 0 if provided";
    }
    // optional: validate timesheetId is integer
    if (form.timesheetId && !/^\d+$/.test(String(form.timesheetId))) {
      newErrors.timesheetId = "Timesheet ID must be a whole number";
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
    setErrors({});

    if (!validate()) return;

    setLoading(true);

    // Ensure numeric values are sent as numbers.
    // Keep two decimal places for hours and rate where relevant.
    const hoursNum = parseFloat(form.hours);
    const hoursToSend = Number(Number.isFinite(hoursNum) ? Number(hoursNum.toFixed(2)) : hoursNum);

    let rateNum = null;
    if (form.rateAtEntry !== "" && form.rateAtEntry !== null) {
      rateNum = parseFloat(form.rateAtEntry);
      rateNum = Number.isFinite(rateNum) ? Number(rateNum.toFixed(2)) : rateNum;
    }

    const payload = {
      timesheetId: parseInt(form.timesheetId, 10),
      entryDate: formatDate(form.entryDate),
      description: form.description,
      hours: hoursToSend,
      rateAtEntry: rateNum,
      taskId: form.taskId ? parseInt(form.taskId, 10) : null,
    };

    try {
      const res = await axiosClient.post("/time-entries", payload);
      // Backend wraps response in TmsApiResponse { status, message, data }
      const created = res?.data?.data ?? res?.data ?? null;

      // If created is null-ish, fallback to payload
      const createdEntry = created ?? payload;

      setSuccess("✅ Time entry created successfully!");

      // Keep message visible briefly, then notify parent/listeners and reset form
      timerRef.current = setTimeout(() => {
        window.dispatchEvent(new CustomEvent("timeEntryCreated", { detail: createdEntry }));

        // reset form
        setForm({
          timesheetId: "",
          entryDate: null,
          description: "",
          hours: "",
          rateAtEntry: "",
          taskId: "",
        });

        setSuccess("");
        timerRef.current = null;
      }, 1200);
    } catch (err) {
      // Defensive extraction of backend error formats
      const resp = err?.response?.data;
      if (resp) {
        // If backend returns validation errors map: { errors: { field: "msg" } }
        if (resp.errors && typeof resp.errors === "object") {
          setErrors((prev) => ({ ...prev, ...resp.errors }));
          setApiError(resp.message || "Validation failed");
        } else if (resp.data && resp.data.errors) {
          setErrors((prev) => ({ ...prev, ...resp.data.errors }));
          setApiError(resp.data.message || resp.message || "Validation failed");
        } else {
          // fallback to message fields
          setApiError(resp.message || resp.error || JSON.stringify(resp) || "Failed to create time entry");
        }
      } else {
        setApiError(err.message || "Failed to create time entry");
      }
      console.error("NewTimeEntry submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      timesheetId: "",
      entryDate: null,
      description: "",
      hours: "",
      rateAtEntry: "",
      taskId: "",
    });
    setErrors({});
    setApiError("");
    setSuccess("");
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Custom Date input with calendar icon
  const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
    <div className="relative w-full">
      <input
        ref={ref}
        type="text"
        readOnly
        value={value}
        onClick={onClick}
        placeholder="YYYY-MM-DD"
        className="w-full border px-3 py-2 rounded focus:ring focus:ring-blue-300 pr-10"
      />
      <FaRegCalendarAlt
        onClick={onClick}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer hover:text-blue-500"
      />
    </div>
  ));

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">New Time Entry</h2>

      {apiError && (
        <p className="mb-3 text-red-600 font-medium bg-red-100 p-2 rounded">{apiError}</p>
      )}

      {success && (
        <p className="mb-3 text-green-700 font-medium bg-green-100 p-2 rounded">{success}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Timesheet ID */}
        <div>
          <label className="block mb-1 font-medium">Timesheet ID</label>
          <input
            type="number"
            name="timesheetId"
            value={form.timesheetId}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:ring focus:ring-blue-300"
          />
          {errors.timesheetId && <p className="text-red-600 text-sm mt-1">{errors.timesheetId}</p>}
        </div>

        {/* Entry Date */}
        <div>
          <label className="block mb-1 font-medium">Entry Date</label>
          <DatePicker
            selected={form.entryDate}
            onChange={(date) => setForm((prev) => ({ ...prev, entryDate: date }))}
            dateFormat="yyyy-MM-dd"
            customInput={<CustomDateInput />}
          />
          {errors.entryDate && <p className="text-red-600 text-sm mt-1">{errors.entryDate}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:ring focus:ring-blue-300"
          />
          {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* Hours */}
        <div>
          <label className="block mb-1 font-medium">Hours</label>
          <input
            type="number"
            step="0.01"
            name="hours"
            value={form.hours}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:ring focus:ring-blue-300"
          />
          {errors.hours && <p className="text-red-600 text-sm mt-1">{errors.hours}</p>}
        </div>

        {/* Rate */}
        <div>
          <label className="block mb-1 font-medium">Rate (optional)</label>
          <input
            type="number"
            step="0.01"
            name="rateAtEntry"
            value={form.rateAtEntry}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:ring focus:ring-blue-300"
          />
          {errors.rateAtEntry && <p className="text-red-600 text-sm mt-1">{errors.rateAtEntry}</p>}
        </div>

        {/* Task ID (optional) */}
        <div>
          <label className="block mb-1 font-medium">Task ID (optional)</label>
          <input
            type="number"
            name="taskId"
            value={form.taskId}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:ring focus:ring-blue-300"
          />
          {errors.taskId && <p className="text-red-600 text-sm mt-1">{errors.taskId}</p>}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Saving..." : "Create"}
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

export default NewTimeEntry;
