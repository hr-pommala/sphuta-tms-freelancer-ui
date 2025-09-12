import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function NewProject() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    clientId: "",
    projectName: "",
    code: "",
    hourlyRate: "",
    startDate: "",
    endDate: "",
    description: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  // Toast state
  const [toast, setToast] = useState({ type: "", message: "" });
  const toastTimer = useRef(null);

  const showToast = (type, message) => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast({ type: "", message: "" }), 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get("/projects/clients?active=true&page=0&size=100");
        setClients(res.data.data?.content || []);
      } catch (err) {
        console.error("Error fetching clients:", err);
        showToast("error", "Failed to load clients.");
      }
    };
    fetchClients();
  }, []);

  // Helper: safe parse YYYY-MM-DD -> Date at midnight (avoids timezone shifts)
  const parseDateOnly = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr + "T00:00:00");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newVal = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: newVal };

      // If startDate changed and existing endDate is before new startDate, clear endDate.
      if (name === "startDate" && prev.endDate) {
        // string compare works for YYYY-MM-DD format
        if (prev.endDate < (newVal || "")) {
          updated.endDate = ""; // or set to newVal if you prefer auto-fill
        }
      }

      return updated;
    });

    // clear the specific field error as user types/changes it
    setErrors((prev) => {
      if (!prev[name]) {
        // also clear endDate error if startDate changed
        if (name === "startDate" && prev.endDate) {
          const copy = { ...prev };
          delete copy.endDate;
          return copy;
        }
        return prev;
      }
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.clientId) newErrors.clientId = "Client is required";
    if (!formData.projectName.trim()) newErrors.projectName = "Project Name is required";
    if (!formData.code.trim()) newErrors.code = "Code is required";

    const hourly = Number(formData.hourlyRate);
    if (!formData.hourlyRate || isNaN(hourly) || hourly <= 0)
      newErrors.hourlyRate = "Hourly Rate must be greater than 0";

    if (!formData.startDate) newErrors.startDate = "Start Date is required";

    const start = parseDateOnly(formData.startDate);
    const end = parseDateOnly(formData.endDate);

    if (start && end && end < start) {
      newErrors.endDate = "End Date cannot be before Start Date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      showToast("error", "Please fix the validation errors.");
      return;
    }

    try {
      await api.post("/projects/projects", {
        ...formData,
        clientId: Number(formData.clientId),
        hourlyRate: Number(formData.hourlyRate),
      });
      showToast("success", "Project created successfully!");
      setTimeout(() => navigate("/projects"), 800);
    } catch (error) {
      console.error("Error creating project:", error);
      showToast("error", "Failed to create project. Please try again.");
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg border border-gray-300 relative">
      {/* Toast */}
      {toast.message && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-md px-4 py-3 shadow-lg border ${
            toast.type === "success"
              ? "bg-green-50 border-green-300 text-green-800"
              : "bg-red-50 border-red-300 text-red-800"
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="font-semibold">
              {toast.type === "success" ? "Success" : "Error"}
            </span>
            <span className="text-sm">{toast.message}</span>
            <button
              onClick={() => setToast({ type: "", message: "" })}
              className="ml-2 text-sm opacity-70 hover:opacity-100"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900 mb-4">New Project</h3>

      <form onSubmit={handleSubmit}>
        {/* Client Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Client *</label>
          <select
            name="clientId"
            value={formData.clientId}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
          >
            <option value="">Select Client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || c.companyName}
              </option>
            ))}
          </select>
          {errors.clientId && <p className="text-red-500 text-sm">{errors.clientId}</p>}
        </div>

        {/* Project Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Project Name *</label>
          <input
            type="text"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
          />
          {errors.projectName && <p className="text-red-500 text-sm">{errors.projectName}</p>}
        </div>

        {/* Code */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Code *</label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
          />
          {errors.code && <p className="text-red-500 text-sm">{errors.code}</p>}
        </div>

        {/* Hourly Rate */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Hourly Rate *</label>
          <input
            type="number"
            step="0.01"
            name="hourlyRate"
            value={formData.hourlyRate}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
          />
          {errors.hourlyRate && <p className="text-red-500 text-sm">{errors.hourlyRate}</p>}
        </div>

        {/* Dates */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date *</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
            />
            {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
              min={formData.startDate || undefined} // <-- restrict selectable dates
            />
            {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate}</p>}
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
            rows="3"
          ></textarea>
        </div>

        {/* Active */}
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="text-sm font-medium text-gray-700">Active Project</label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Add Project
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewProject;
