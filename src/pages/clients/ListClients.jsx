// src/pages/clients/ListClients.jsx
import React, { useEffect, useMemo, useState } from "react";
import { FaPlus, FaDownload, FaSlidersH, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import * as clientsApi from "../../api/clients"; // your lightweight clients API wrapper

/* ---------- static options ---------- */
const FIELD_OPTIONS = [
  "Name",
  "Email",
  "Phone",
  "Company",
  "Address 1",
  "Address 2",
  "City",
  "State/Province",
  "Zip/Postal",
  "Country",
];

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

/* ---------- helpers ---------- */
const dedupeById = (arr) => {
  const seen = new Set();
  return (arr || []).filter((it) => {
    if (!it || it.id == null) return false;
    if (seen.has(it.id)) return false;
    seen.add(it.id);
    return true;
  });
};

// Defensive extractor for variable response shapes
const extractArray = (res) => {
  // res is an axios response or maybe undefined
  if (!res) return [];
  const d = res.data ?? null;
  if (!d) return [];
  // Common shapes:
  // 1) { data: { content: [...] } }  -> res.data.data.content
  // 2) { data: [...] }               -> res.data.data
  // 3) { content: [...] }            -> res.data.content
  // 4) [ ... ]                       -> res.data (array)
  if (Array.isArray(d)) return d;
  if (Array.isArray(d.data)) return d.data;
  if (Array.isArray(d.content)) return d.content;
  if (d.data && Array.isArray(d.data?.content)) return d.data.content;
  return [];
};

/* ---------- component ---------- */
export default function ListClients() {
  const navigate = useNavigate();

  const [activeClients, setActiveClients] = useState([]);
  const [archivedClients, setArchivedClients] = useState([]);
  const [activeTab, setActiveTab] = useState("All"); // "All" or "Archived"
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // per-row select state
  const [actionSel, setActionSel] = useState({});

  // Download fields modal state
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [selectedFields, setSelectedFields] = useState(() =>
    FIELD_OPTIONS.reduce((acc, f) => ({ ...acc, [f]: true }), {})
  );

  // small toasts stack for non-blocking feedback
  const [toasts, setToasts] = useState([]);

  // Confirm modal state for delete flow
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ---------- fetch clients ----------
  const fetchClients = async () => {
    setLoading(true);
    try {
      // use the clientsApi wrapper which returns raw axios promises
      const [resActive, resArchived] = await Promise.all([
        clientsApi.listClients({ active: true, search, page: 0, size: 200 }),
        clientsApi.listClients({ active: false, search, page: 0, size: 200 }),
      ]);

      const rawActive = extractArray(resActive);
      const rawArchived = extractArray(resArchived);

      setActiveClients(dedupeById(rawActive));
      setArchivedClients(dedupeById(rawArchived));
    } catch (err) {
      console.error("Failed to fetch clients:", err);
      setActiveClients([]);
      setArchivedClients([]);
      pushToast({ kind: "error", text: "Failed to load clients" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  /* ---------- Confirm modal (inline) ---------- */
  const ConfirmModal = ({ open, title, message, onConfirm, onCancel, loading }) => {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black opacity-40" onClick={onCancel}></div>
        <div className="relative bg-white rounded shadow-lg max-w-md w-full p-6 z-50">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-gray-700 mb-4">{message}</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 border rounded"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ---------- CRUD actions (re-used) ---------- */
  const handleArchive = async (id) => {
    try {
      await clientsApi.archiveClient(id);
      pushToast({ kind: "success", text: `Archived client id=${id}` });
      await fetchClients();
    } catch (err) {
      console.error("Archive failed:", err);
      pushToast({ kind: "error", text: err?.response?.data?.message || "Archive failed" });
      throw err;
    }
  };

  const handleUnarchive = async (id) => {
    try {
      await clientsApi.unarchiveClient(id);
      pushToast({ kind: "success", text: `Unarchived client id=${id}` });
      await fetchClients();
    } catch (err) {
      console.error("Unarchive failed:", err);
      pushToast({ kind: "error", text: err?.response?.data?.message || "Unarchive failed" });
      throw err;
    }
  };

  // NOTE: now this only opens the confirm modal. The actual delete happens in confirmDelete()
  const handleAskDelete = (id) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDeleteId) return;
    setDeleteLoading(true);
    try {
      await clientsApi.deleteClient(toDeleteId);
      pushToast({ kind: "success", text: `Deleted client id=${toDeleteId}` });
      // refresh the list
      await fetchClients();
      // also show the requested alert message after delete
      window.alert(`${toDeleteId} profile deleted`);
    } catch (err) {
      console.error("Delete failed:", err);
      pushToast({ kind: "error", text: err?.response?.data?.message || "Delete failed" });
      window.alert("Delete failed. See console for details.");
      throw err;
    } finally {
      setDeleteLoading(false);
      setConfirmOpen(false);
      setToDeleteId(null);
    }
  };

  /* ---------- navigation helpers ---------- */
  const goNew = () => navigate("/clients/new");
  const goEdit = (id) => navigate(`/clients/edit/${id}`);

  /* ---------- list & filtering ---------- */
  const list = activeTab === "All" ? activeClients : archivedClients;

  const filtered = list.filter((c) => {
    if (!c) return false;
    const hay = [
      c.name,
      c.firstName,
      c.lastName,
      c.companyName,
      c.email,
      c.mobilePhone,
      c.addressLine1,
      c.addressLine2,
      c.city,
      c.state,
      c.postalCode,
      c.countryCode,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes((search || "").toLowerCase());
  });

  /* ---------- download excel ---------- */
  const downloadExcel = () => {
    const data = filtered.length ? filtered : list;
    if (!data.length) {
      pushToast({ kind: "info", text: "No client records to download." });
      return;
    }
    const rows = data.map((c) => {
      const row = {};
      if (selectedFields["Name"]) row["Name"] = c.name || `${c.firstName || ""} ${c.lastName || ""}`.trim();
      if (selectedFields["Email"]) row["Email"] = c.email || "";
      if (selectedFields["Phone"]) row["Phone"] = c.mobilePhone || "";
      if (selectedFields["Company"]) row["Company"] = c.companyName || "";
      if (selectedFields["Address 1"]) row["Address 1"] = c.addressLine1 || "";
      if (selectedFields["Address 2"]) row["Address 2"] = c.addressLine2 || "";
      if (selectedFields["City"]) row["City"] = c.city || "";
      if (selectedFields["State/Province"]) row["State/Province"] = c.state || "";
      if (selectedFields["Zip/Postal"]) row["Zip/Postal"] = c.postalCode || "";
      if (selectedFields["Country"]) row["Country"] = c.countryCode || "";
      return row;
    });

    const fieldsToInclude = FIELD_OPTIONS.filter((f) => selectedFields[f]);
    const ws = XLSX.utils.json_to_sheet(rows, { header: fieldsToInclude });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clients");
    XLSX.writeFile(wb, `Clients_${activeTab}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setShowFilterPopup(false);
    pushToast({ kind: "success", text: "Exported clients" });
  };

  /* ---------- select action handling ---------- */
  const handleAction = async (id, value) => {
    if (!id || !value) return;
    // optimistic UX: reset selection after processing
    const reset = () => setActionSel((prev) => ({ ...prev, [id]: "" }));

    try {
      if (value === "edit") {
        goEdit(id);
      } else if (value === "new-invoice") {
        navigate(`/invoices/new?clientId=${id}`);
      } else if (value === "new-estimate") {
        navigate(`/estimates/new?clientId=${id}`);
      } else if (value === "archive") {
        await handleArchive(id);
      } else if (value === "unarchive") {
        await handleUnarchive(id);
      } else if (value === "delete") {
        // open modal instead of directly deleting
        handleAskDelete(id);
      }
    } catch (err) {
      // already handled inside called functions (toasts)
      console.error("Action failed for id=", id, value, err);
    } finally {
      reset();
    }
  };

  /* ---------- field toggle helpers ---------- */
  const toggleField = (field) => setSelectedFields((prev) => ({ ...prev, [field]: !prev[field] }));
  const selectAllFields = () => setSelectedFields(FIELD_OPTIONS.reduce((acc, f) => ({ ...acc, [f]: true }), {}));
  const unselectAllFields = () => setSelectedFields(FIELD_OPTIONS.reduce((acc, f) => ({ ...acc, [f]: false }), {}));

  /* ---------- toast helpers ---------- */
  const pushToast = (t) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, ...t }]);
    // auto-dismiss after 4s
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 4000);
  };

  /* ---------- UI ---------- */
  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Clients</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={goNew}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md shadow"
          >
            <FaPlus /> Add Client
          </button>

          <button
            onClick={() => setShowFilterPopup(true)}
            className="flex items-center justify-center w-10 h-10 bg-white border rounded shadow"
            title="Download fields / options"
          >
            <FaSlidersH />
          </button>

          <button
            onClick={downloadExcel}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow"
          >
            <FaDownload /> Download Clients
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-4">
        <button
          className={`px-4 py-2 rounded ${activeTab === "All" ? "bg-gray-200" : "bg-white border"}`}
          onClick={() => setActiveTab("All")}
        >
          All
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === "Archived" ? "bg-gray-200" : "bg-white border"}`}
          onClick={() => setActiveTab("Archived")}
        >
          Archived
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <FaSearch className="absolute top-3 left-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-4 py-2 border rounded w-full md:w-1/2"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-gray-100">
              <tr>
                {[
                  "Name",
                  "Email",
                  "Phone",
                  "Company",
                  "Address 1",
                  "Address 2",
                  "City",
                  "State/Province",
                  "Zip/Postal",
                  "Country",
                  "Actions",
                ].map((h) => (
                  <th key={h} className="p-2 text-left text-sm font-medium text-gray-600 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr><td colSpan={11} className="p-4 text-center text-gray-500">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={11} className="p-4 text-center text-gray-500">No records available</td></tr>
              ) : (
                filtered.map((c, idx) => (
                  <tr key={c.id ?? idx} className="border-t hover:bg-gray-50">
                    <td className="p-2 whitespace-nowrap">
                      {c.name || `${c.firstName || ""} ${c.lastName || ""}`.trim()}
                    </td>
                    <td className="p-2 whitespace-nowrap">{c.email}</td>
                    <td className="p-2 whitespace-nowrap">{c.mobilePhone}</td>
                    <td className="p-2 whitespace-nowrap">{c.companyName}</td>
                    <td className="p-2 whitespace-nowrap">{c.addressLine1}</td>
                    <td className="p-2 whitespace-nowrap">{c.addressLine2}</td>
                    <td className="p-2 whitespace-nowrap">{c.city}</td>
                    <td className="p-2 whitespace-nowrap">{c.state}</td>
                    <td className="p-2 whitespace-nowrap">{c.postalCode}</td>
                    <td className="p-2 whitespace-nowrap">{c.countryCode}</td>

                    {/* Actions: per-row select */}
                    <td className="p-2 whitespace-nowrap">
                      <select
                        className="px-2 py-1 rounded border bg-gray-50"
                        value={actionSel[c.id] ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setActionSel((prev) => ({ ...prev, [c.id]: val }));
                          handleAction(c.id, val);
                        }}
                        disabled={!c.id}
                        aria-label={`Actions for client ${c.id}`}
                      >
                        <option value="" disabled>
                          Select Action
                        </option>

                        {activeTab === "All" ? (
                          <>
                            <option value="edit">✏️ Edit Client</option>
                            <option value="new-invoice">🧾 New Invoice</option>
                            <option value="new-estimate">📄 New Estimate</option>
                            <option value="archive">🗂️ Archive</option>
                          </>
                        ) : (
                          <>
                            <option value="edit">✏️ Edit Client</option>
                            <option value="unarchive">↩️ Unarchive</option>
                            <option value="delete">🗑️ Delete</option>
                          </>
                        )}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create button */}
      <div className="mt-6">
        <button
          onClick={goNew}
          className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center justify-center"
        >
          <FaPlus className="mr-2" /> Create a Client
        </button>
      </div>

      {/* Download fields modal */}
      {showFilterPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowFilterPopup(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2 text-center">Download fields</h2>
            <p className="text-sm text-center text-gray-500 mb-4">Select the fields to include in Excel</p>

            <div className="flex justify-between mb-3">
              <button className="text-blue-500" onClick={unselectAllFields}>Unselect all</button>
              <button className="text-blue-500" onClick={selectAllFields}>Select all</button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4 max-h-64 overflow-y-auto">
              {FIELD_OPTIONS.map((f) => (
                <label key={f} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!!selectedFields[f]}
                    onChange={() => toggleField(f)}
                  />
                  <span>{f}</span>
                </label>
              ))}
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 py-2 bg-gray-300 rounded" onClick={() => setShowFilterPopup(false)}>
                Cancel
              </button>
              <button className="flex-1 py-2 bg-green-600 text-white rounded" onClick={downloadExcel}>
                Download Excel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast stack */}
      <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2 rounded shadow text-sm ${
              t.kind === "error" ? "bg-red-100 text-red-800" : t.kind === "success" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>

      {/* Confirm delete modal (inline usage as requested) */}
      <ConfirmModal
        open={confirmOpen}
        title="Confirm delete"
        message={`Are you sure you want to delete profile for userId ${toDeleteId}?`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setToDeleteId(null);
        }}
        loading={deleteLoading}
      />
    </div>
  );
}
