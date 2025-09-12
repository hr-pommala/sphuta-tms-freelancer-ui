import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";

function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [errors, setErrors] = useState({});

  // Toast state
  const [toast, setToast] = useState({ type: "", message: "" });
  const toastTimer = useRef(null);

  const showToast = (type, message) => {
    // clear previous timer
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

  // Normalize a project object (from list or fallback) into form shape
  const normalizeProject = (p) => ({
    clientId: p?.clientId ?? p?.client?.id ?? "",
    projectName: p?.projectName ?? p?.name ?? "",
    code: p?.code ?? "",
    hourlyRate: p?.hourlyRate ?? "",
    startDate: p?.startDate ?? "",
    endDate: p?.endDate ?? "",
    description: p?.description ?? "",
    isActive: (p?.isActive ?? p?.active ?? true),
  });

  // Prefill from router state if available
  useEffect(() => {
    const fromState = location.state?.project;
    if (fromState) {
      setFormData(normalizeProject(fromState));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // Fetch clients for dropdown
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

  // Fallback: if we don't have project in state, fetch from list and find by id
  useEffect(() => {
    const fetchProjectFallback = async () => {
      if (formData) return; // already have it from state
      setLoadError("");

      const findById = (list) => (list || []).find((p) => p.id === Number(id)) || null;

      try {
        // Try active=true first
        let res = await api.get(`/projects/projects?active=true&page=0&size=1000&search=${id}`);
        let proj = findById(res.data.data?.content);

        // If not found, try archived
        if (!proj) {
          res = await api.get(`/projects/projects?active=false&page=0&size=1000&search=${id}`);
          proj = findById(res.data.data?.content);
        }

        if (!proj) {
          setLoadError("Project not found.");
          return;
        }

        setFormData(normalizeProject(proj));
      } catch (err) {
        console.error("Error fetching project via list fallback:", err);
        setLoadError("Unable to load the project. Please try again.");
        showToast("error", "Unable to load the project.");
      }
    };

    fetchProjectFallback();
  }, [id, formData]);

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
      if (name === "startDate" && prev?.endDate) {
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
        // also clear endDate error when startDate changed (since that can fix it)
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
    if (!formData.projectName || !formData.projectName.trim()) newErrors.projectName = "Project Name is required";
    if (!formData.code || !formData.code.trim()) newErrors.code = "Code is required";

    const hourly = Number(formData.hourlyRate);
    if (!formData.hourlyRate || isNaN(hourly) || hourly <= 0)
      newErrors.hourlyRate = "Hourly Rate must be greater than 0";

    if (!formData.startDate) newErrors.startDate = "Start Date is required";

    // Robust date comparison: convert to Date objects and compare
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
      await api.put(`/projects/projects/${id}`, {
        ...formData,
        clientId: Number(formData.clientId),
        hourlyRate: Number(formData.hourlyRate),
      });
      showToast("success", `Project #${id} updated.`);
      // small delay so user sees toast
      setTimeout(() => navigate("/projects"), 800);
    } catch (err) {
      console.error("Error updating project:", err);
      // try to show a meaningful message if backend returns one
      const msg = err?.response?.data?.message || "Update failed. Please try again.";
      showToast("error", msg);
    }
  };

  if (!formData) {
    return <p className="text-center mt-6 text-gray-500">{loadError || "Loading project..."}</p>;
  }

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

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Project</h3>
      <form onSubmit={handleSubmit}>
        {/* Client Dropdown */}
        <div className="mb-4">
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
          {errors.clientId && <p className="text-red-500 text-sm mt-1">{errors.clientId}</p>}
        </div>

        {/* Project Name */}
        <div className="mb-4">
          <input
            type="text"
            name="projectName"
            value={formData.projectName || ""}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
            placeholder="Project Name"
          />
          {errors.projectName && <p className="text-red-500 text-sm mt-1">{errors.projectName}</p>}
        </div>

        {/* Code */}
        <div className="mb-4">
          <input
            type="text"
            name="code"
            value={formData.code || ""}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
            placeholder="Code"
          />
          {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
        </div>

        {/* Hourly Rate */}
        <div className="mb-4">
          <input
            type="number"
            step="0.01"
            name="hourlyRate"
            value={formData.hourlyRate || ""}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
            placeholder="Hourly Rate"
          />
          {errors.hourlyRate && <p className="text-red-500 text-sm mt-1">{errors.hourlyRate}</p>}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="date"
            name="startDate"
            value={formData.startDate || ""}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
          />
          <input
            type="date"
            name="endDate"
            value={formData.endDate || ""}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
            min={formData.startDate || undefined}
          />
        </div>
        {errors.startDate && <p className="text-red-500 text-sm mb-2">{errors.startDate}</p>}
        {errors.endDate && <p className="text-red-500 text-sm mb-2">{errors.endDate}</p>}

        {/* Description */}
        <div className="mb-4">
          <textarea
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
            rows="3"
            placeholder="Description"
          />
        </div>

        {/* Active */}
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive || false}
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
            update
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProject;
