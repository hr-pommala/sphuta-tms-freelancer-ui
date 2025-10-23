// src/pages/TimeEntries/TimeEntryPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { FiClock, FiCalendar } from "react-icons/fi";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import timesheetsApi from "../../api/timesheets";
import api from "../../api/axios";
import tasksApi from "../../api/tasksApi";
import AlertModal from "../../components/ui/AlertModal";

/* -------------------------
   Helpers (unchanged, small tweaks)
   ------------------------- */
function startOfWeekMonday(d) {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  const day = dt.getDay(); // 0=Sun..6=Sat
  const shift = day === 0 ? -6 : 1 - day; // Monday-first
  dt.setDate(dt.getDate() + shift);
  return dt;
}

function isoKey(d) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getWeekDates(currentDate) {
  const start = startOfWeekMonday(currentDate);
  const arr = [];
  for (let i = 0; i < 7; i++) {
    const dd = new Date(start);
    dd.setDate(start.getDate() + i);
    arr.push(dd);
  }
  return arr;
}
function buildMonthWeeks(dateInMonth) {
  const y = dateInMonth.getFullYear();
  const m = dateInMonth.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  const firstWeekStart = startOfWeekMonday(first);
  const weeks = [];
  let cursor = new Date(firstWeekStart);
  while (true) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
    if (week.some(day => day.getMonth() === m && day.getDate() === last.getDate())) break;
    if (weeks.length > 10) break; // safety guard
  }
  return weeks;
}
function dayName(date) {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}
function shortMonthDay(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function monthKeyFromDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/* -------------------------
   Small inline hook: useProjects
   ------------------------- */
function useProjects({ clientId = null, active = true } = {}) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const qs = new URLSearchParams();
    if (active !== undefined) qs.append("active", active);
    qs.append("page", 0);
    qs.append("size", 200);
    if (clientId) qs.append("clientId", clientId);

    const url = `/projects/projects?${qs.toString()}`;

    api.get(url)
      .then(res => {
        if (!mounted) return;
        const candidate =
          res?.data?.data?.content ??
          res?.data?.data ??
          res?.data ??
          res;
        const list = Array.isArray(candidate) ? candidate : [];
        const normalized = list.map(raw => ({
          id: raw.id ?? raw.projectId ?? raw.timesheetId,
          name: raw.projectName ?? raw.name ?? raw.title ?? raw.code,
          code: raw.code ?? raw.projectCode ?? "",
          hourlyRate: raw.hourlyRate ?? raw.rate ?? raw.hourly ?? null,
          startDate: raw.startDate ?? raw.periodStart ?? null,
          endDate: raw.endDate ?? raw.periodEnd ?? null,
          isActive: raw.isActive ?? raw.active ?? true,
          client: raw.client ?? raw.clientDto ?? null,
          color: raw.color ?? "#2563eb",
          __raw: raw,
        }));
        setProjects(normalized);
      })
      .catch(err => {
        if (!mounted) return;
        console.error("useProjects error", err);
        setError(err);
        setProjects([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [clientId, active]);

  return { projects, loading, error };
}

/* -------------------------
   Normalize axios / api responses helper
   - works with axios res, res.data, res.data.data, wrapped responses used by your backend
   ------------------------- */
function normalizeAxiosData(res) {
  if (res === undefined || res === null) return null;
  // if this is already a plain array/object
  if (Array.isArray(res)) return res;
  if (typeof res !== "object") return res;
  // axios response
  if (res?.data !== undefined) {
    const d = res.data;
    // some of your backend responses use wrapper { status, message, data }
    if (d && typeof d === "object" && d.data !== undefined) return d.data;
    // swagger response may use data directly
    return d;
  }
  // fallback: return as-is
  return res;
}

/* -------------------------
   Component: TimeEntryPage
   ------------------------- */
export default function TimeEntryPage() {
  const [view, setView] = useState("WEEKLY"); // WEEKLY | MONTHLY
  const [currentDate, setCurrentDate] = useState(new Date());

  // clients (for the Client selector) - kept loading logic but UI dropdown removed as requested
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [clientsError, setClientsError] = useState(null);

  // selected client filters projects shown on page (kept for backend filtering if needed)
  const [selectedClientId] = useState("");

  // projects come from the hook, filtered by selected client
  const { projects, loading: loadingProjects } = useProjects({
    clientId: selectedClientId || null,
    active: true,
  });

  // NEW: tasks & loading state per project
  const [projectTasks, setProjectTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // weeklyEntries: { "YYYY-MM-DD": { "<projectId>": { "<task>": "string value" } } }
  const [weeklyEntries, setWeeklyEntries] = useState({});
  // monthlyEntries: { "<projectId>": { "<dayNumber>": "string value" } }
  const [monthlyEntries, setMonthlyEntries] = useState({});
  const [saving, setSaving] = useState(false);

  // track submitted months (array of "YYYY-MM" keys)
  const [submittedMonthKeys, setSubmittedMonthKeys] = useState([]);

  // validation errors
  const [validationErrors, setValidationErrors] = useState({});

  // selected project per view
  const [selectedWeeklyProjectId, setSelectedWeeklyProjectId] = useState("");
  const [monthlySelectedProjectId, setMonthlySelectedProjectId] = useState("");

  // modal state for submission confirmation
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // alert modal state
  const [alertState, setAlertState] = useState({ open: false, message: "", type: "info" });

  // load clients once (kept but Client dropdown removed from UI)
  useEffect(() => {
    let mounted = true;
    setLoadingClients(true);
    setClientsError(null);

    api
      .get("/projects/clients?active=true&page=0&size=200")
      .then(res => {
        if (!mounted) return;
        const candidate =
          res?.data?.data?.content ?? res?.data?.data ?? res?.data ?? res;
        const list = Array.isArray(candidate) ? candidate : [];
        setClients(list.map(c => ({
          id: c.id ?? c.clientId,
          name: c.name ?? c.companyName ?? c.clientName,
          __raw: c
        })));
      })
      .catch(err => {
        if (!mounted) return;
        console.error("Failed to load clients", err);
        setClientsError(err);
        setClients([]);
      })
      .finally(() => {
        if (mounted) setLoadingClients(false);
      });

    return () => { mounted = false; };
  }, []);

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);
  const monthWeeks = useMemo(() => buildMonthWeeks(currentDate), [currentDate]);

  const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
  const isCurrentMonthSubmitted = submittedMonthKeys.includes(currentMonthKey);

  /* helpers for inputs & validation */
  function makeWeeklyKey(dateIso, projectId, task) {
    return `W|${dateIso}|${projectId}|${task}`;
  }
  function makeMonthlyKey(projectId, dayNumber) {
    return `M|${projectId}|${dayNumber}`;
  }

  function normalizeHourInput(raw) {
    if (raw === "" || raw === null || raw === undefined) return "";
    const s = String(raw).trim();
    if (s === "" || s === "-" || s === "." || s === "-.") return s;
    const num = Number(s);
    if (Number.isNaN(num)) return s;
    if (num <= 0) return "";
    if (num < 0.01) return "0.01";
    if (num > 23.59) return "23.59";
    const fixed = Number(num.toFixed(2));
    return Number.isInteger(fixed) ? String(Math.trunc(fixed)) : String(fixed);
  }
  function validateHourValue(value) {
    if (value === "" || value === null || value === undefined) return { ok: true };
    const num = Number(value);
    if (Number.isNaN(num)) return { ok: false, msg: "Invalid number" };
    if (num < 0.01 || num > 23.59) return { ok: false, msg: "Must be between 0.01 and 23.59" };
    return { ok: true };
  }

  /* ---------- TASK loading for selected project ---------- */
  async function loadTasksForProject(projectId) {
    if (!projectId) {
      setProjectTasks([]);
      return;
    }
    setLoadingTasks(true);
    try {
      const tList = await tasksApi.listByProject(projectId);
      // tasksApi.listByProject might return axios response or array
      const arr = normalizeAxiosData(tList) ?? [];
      const list = Array.isArray(arr) ? arr : [];
      const normalized = list.map((r, idx) => ({
        id: r.id ?? r.taskId ?? `tmp-${idx}`,
        taskName: r.taskName ?? r.name ?? r.title ?? "Task",
        description: r.description ?? "",
      }));
      setProjectTasks(normalized);
    } catch (err) {
      console.warn("Failed to load tasks for project", projectId, err);
      setProjectTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  }

  /* ---------- timesheet entries helpers ---------- */
  function parseTaskFromDescription(desc) {
    if (!desc || typeof desc !== "string") return null;
    const m = desc.match(/Task:\s*([A-Za-z0-9 _-]+)/i);
    if (m && m[1]) return m[1].trim();
    return null;
  }

  async function fetchEntriesByTimesheetId(tsId) {
    if (!tsId) return [];
    try {
      const res = await timesheetsApi.listEntriesByTimesheet(tsId);
      const normalized = normalizeAxiosData(res) ?? [];
      if (Array.isArray(normalized)) return normalized;
      if (normalized && Array.isArray(normalized.entries)) return normalized.entries;
      if (res?.data && Array.isArray(res.data)) return res.data;
      if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
    } catch (err) {
      console.warn("fetchEntriesByTimesheetId failed for", tsId, err, err?.response?.status, err?.response?.data);
    }
    return [];
  }

  // Load or get/create timesheet and then load entries; returns {weekly:{}, monthly:{}}
  async function loadEntriesForProjectAndPeriod(projectId, periodStart, periodEnd) {
    if (!projectId) return { weekly: {}, monthly: {} };

    try {
      // try to find existing timesheet via listTimesheets (tolerant)
      let listResp = null;
      try {
        listResp = await timesheetsApi.listTimesheets();
      } catch (err) {
        // ignore; not fatal
      }

      let found = null;
      const candidate = normalizeAxiosData(listResp) ?? [];
      if (Array.isArray(candidate) && candidate.length) {
        found = candidate.find(t => {
          const pid = (t.projectId ?? t.project_id ?? t.projectId) || null;
          const ps = (t.periodStart ?? t.period_start ?? t.periodStart) || null;
          const pe = (t.periodEnd ?? t.period_end ?? t.periodEnd) || null;
          return Number(pid) === Number(projectId) && String(ps) === String(periodStart) && String(pe) === String(periodEnd);
        });
      }

      let timesheet = null;
      if (found) {
        timesheet = found;
      } else {
        // use the resilient wrapper from your api layer; it will POST /timesheets or fallback
        try {
          const res = await timesheetsApi.getOrCreateTimesheet(projectId, periodStart, periodEnd);
          timesheet = normalizeAxiosData(res) ?? res;
        } catch (err) {
          try {
            const res2 = await timesheetsApi.createTimesheet({ projectId: Number(projectId), periodStart, periodEnd });
            timesheet = normalizeAxiosData(res2) ?? res2;
          } catch (err2) {
            console.warn("Failed to create or resolve timesheet for project", projectId, periodStart, periodEnd, err2);
            return { weekly: {}, monthly: {} };
          }
        }
      }

      // normalize timesheet id
      const tsObj = timesheet?.data ?? timesheet ?? null;
      const tsId =
        tsObj?.id ??
        tsObj?.timesheetId ??
        tsObj?.timesheet_id ??
        tsObj;

      const resolvedTsId = typeof tsId === "object" && tsId !== null
        ? (tsId.id ?? tsId.timesheetId ?? tsId.timesheet_id ?? null)
        : tsId;

      if (!resolvedTsId) {
        console.warn("No timesheet id resolved for project", projectId, periodStart, periodEnd, timesheet);
        return { weekly: {}, monthly: {} };
      }

      // fetch entries for this timesheet
      const entries = await fetchEntriesByTimesheetId(resolvedTsId);
      if (!Array.isArray(entries) || entries.length === 0) return { weekly: {}, monthly: {} };

      // accumulate weekly and monthly structures
      const weekAcc = {};
      const monthAcc = {};

      for (const e of entries) {
        const entryDate = e.entryDate ?? e.date ?? e.entry_date ?? e.createdAt ?? e.created_dt ?? null;
        const hours = (e.hours ?? e.hoursWorked ?? e.duration ?? e.value) ?? null;
        if (!entryDate || hours == null) continue;
        const dt = new Date(entryDate);
        if (Number.isNaN(dt.getTime())) continue;
        const iso = isoKey(dt);
        const dayNum = dt.getDate();
        const taskFromDesc = e.taskName ?? (e.description ? parseTaskFromDescription(e.description) : null) ?? null;
        const tKey = taskFromDesc || (e.taskId ? `task-${e.taskId}` : "Work");

        // weekly accumulator
        weekAcc[iso] = weekAcc[iso] ?? {};
        weekAcc[iso][String(projectId)] = weekAcc[iso][String(projectId)] ?? {};
        weekAcc[iso][String(projectId)][tKey] = String(Number(Number(hours).toFixed(2)));

        // monthly accumulator (sum by day for project)
        monthAcc[String(projectId)] = monthAcc[String(projectId)] ?? {};
        const prev = Number(monthAcc[String(projectId)][String(dayNum)] || 0);
        monthAcc[String(projectId)][String(dayNum)] = prev + Number(hours);
      }

      // stringify monthAcc values to strings
      const monthAccStr = {};
      for (const pid of Object.keys(monthAcc)) {
        monthAccStr[pid] = monthAccStr[pid] ?? {};
        for (const day of Object.keys(monthAcc[pid])) {
          const val = Number(monthAcc[pid][day]);
          monthAccStr[pid][day] = Number.isInteger(val) ? String(val) : String(Number(val.toFixed(2)));
        }
      }

      return { weekly: weekAcc, monthly: monthAccStr };
    } catch (err) {
      console.warn("loadEntriesForProjectAndPeriod failed", err);
      return { weekly: {}, monthly: {} };
    }
  }

  /* ---------- helper to refresh UI state from backend after saves ----------
     This is the key change to prevent double-incrementing: after a successful
     save (weekly/monthly), reload the entries from the server and overwrite
     the UI state with the authoritative values.
  */
  async function refreshEntriesForProjectPeriod(projectId, periodStart, periodEnd) {
    try {
      const { weekly: wAcc, monthly: mAcc } = await loadEntriesForProjectAndPeriod(projectId, periodStart, periodEnd);

      // Merge weekly: ensure we set the project's data for the specific iso dates returned
      setWeeklyEntries(prev => {
        const copy = { ...prev };
        for (const iso of Object.keys(wAcc)) {
          copy[iso] = { ...(copy[iso] ?? {}) };
          // only replace this project's entries for that iso
          copy[iso][String(projectId)] = { ...(wAcc[iso][String(projectId)] ?? {}) };
        }
        return copy;
      });

      // Overwrite monthlyEntries for the project with authoritative data
      setMonthlyEntries(prev => {
        const copy = { ...prev };
        copy[String(projectId)] = { ...(copy[String(projectId)] ?? {}), ...(mAcc[String(projectId)] ?? {}) };
        return copy;
      });
    } catch (err) {
      console.warn("refreshEntriesForProjectPeriod failed", err);
    }
  }

  /* ---------- when project selection changes: load tasks & saved entries ---------- */

  // when weekly selected project changes
  useEffect(() => {
    const pid = selectedWeeklyProjectId;
    if (!pid) {
      setProjectTasks([]);
      return;
    }

    loadTasksForProject(pid);

    const periodStart = isoKey(weekDates[0]);
    const periodEnd = isoKey(weekDates[6]);

    (async () => {
      const { weekly: wAcc, monthly: mAcc } = await loadEntriesForProjectAndPeriod(pid, periodStart, periodEnd);
      setWeeklyEntries(prev => {
        const copy = { ...prev };
        for (const iso of Object.keys(wAcc)) {
          copy[iso] = { ...(copy[iso] ?? {}) };
          copy[iso][String(pid)] = { ...(copy[iso][String(pid)] ?? {}), ...(wAcc[iso][String(pid)] ?? {}) };
        }
        return copy;
      });
      setMonthlyEntries(prev => ({ ...prev, ...mAcc }));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWeeklyProjectId, weekDates]);

  // when monthly selected project changes: load tasks and monthly entries
  useEffect(() => {
    const pid = monthlySelectedProjectId;
    if (!pid) {
      return;
    }
    loadTasksForProject(pid);

    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const periodStart = isoKey(first);
    const periodEnd = isoKey(last);

    (async () => {
      const { weekly: wAcc, monthly: mAcc } = await loadEntriesForProjectAndPeriod(pid, periodStart, periodEnd);
      setWeeklyEntries(prev => {
        const copy = { ...prev };
        for (const iso of Object.keys(wAcc)) {
          copy[iso] = { ...(copy[iso] ?? {}) };
          copy[iso][String(pid)] = { ...(copy[iso][String(pid)] ?? {}), ...(wAcc[iso][String(pid)] ?? {}) };
        }
        return copy;
      });
      setMonthlyEntries(prev => ({ ...prev, ...mAcc }));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthlySelectedProjectId, currentDate]);

  /* ---------- per-day total helpers & validation ---------- */
  function computeDailyTotalForProjectAndIso(projectId, iso) {
    // IMPORTANT: only compute from weeklyEntries (which are refreshed from DB).
    // Do not mix monthlyEntries here — monthly UI is authoritative for month inputs.
    const tasksObj = weeklyEntries[iso]?.[String(projectId)] ?? {};
    let sum = 0;
    for (const t of Object.keys(tasksObj)) sum += Number(tasksObj[t] || 0);
    return sum;
  }

  function setWeeklyValue(dateKey, projectId, taskName, hours) {
    const d = new Date(dateKey);
    const monthKey = monthKeyFromDate(d);
    if (submittedMonthKeys.includes(monthKey)) {
      setAlertState({ open: true, message: "You already submitted hours for this month — you don't have access to update.", type: "info" });
      return;
    }

    const normalized = normalizeHourInput(hours);
    const errKey = makeWeeklyKey(dateKey, projectId, taskName);
    const validation = validateHourValue(normalized === "-" || normalized === "." ? "" : normalized);

    setValidationErrors(prev => {
      const copy = { ...prev };
      if (!validation.ok) copy[errKey] = validation.msg;
      else delete copy[errKey];
      return copy;
    });

    setWeeklyEntries(prev => {
      const copy = { ...prev };
      copy[dateKey] = { ...(copy[dateKey] ?? {}) };
      copy[dateKey][String(projectId)] = { ...(copy[dateKey][String(projectId)] ?? {}) };
      copy[dateKey][String(projectId)][String(taskName)] = normalized;
      return copy;
    });

    setTimeout(() => {
      const total = computeDailyTotalForProjectAndIso(projectId, dateKey);
      if (Number(total) > 24) {
        setValidationErrors(prev => ({ ...prev, [`D|${dateKey}|${projectId}`]: "Daily total exceeds 24h" }));
      } else {
        setValidationErrors(prev => {
          const copy = { ...prev };
          delete copy[`D|${dateKey}|${projectId}`];
          return copy;
        });
      }
    }, 0);
  }
  function getWeeklyValue(dateKey, projectId, taskName) {
    return weeklyEntries[dateKey]?.[String(projectId)]?.[String(taskName)] ?? "";
  }

  function setMonthlyValue(projectId, dayNumber, hours) {
    if (submittedMonthKeys.includes(currentMonthKey)) {
      setAlertState({ open: true, message: "You already submitted hours for this month — you don't have access to update.", type: "info" });
      return;
    }
    const normalized = normalizeHourInput(hours);
    const errKey = makeMonthlyKey(projectId, dayNumber);
    const validation = validateHourValue(normalized === "-" || normalized === "." ? "" : normalized);

    setValidationErrors(prev => {
      const copy = { ...prev };
      if (!validation.ok) copy[errKey] = validation.msg;
      else delete copy[errKey];
      return copy;
    });

    setMonthlyEntries(prev => {
      const copy = { ...prev };
      copy[String(projectId)] = { ...(copy[String(projectId)] ?? {}) };
      copy[String(projectId)][String(dayNumber)] = normalized;
      return copy;
    });

    const total = Number(normalized || 0);
    if (total > 24) {
      setValidationErrors(prev => ({ ...prev, [`D|M|${projectId}|${dayNumber}`]: "Daily total exceeds 24h" }));
    } else {
      setValidationErrors(prev => {
        const copy = { ...prev };
        delete copy[`D|M|${projectId}|${dayNumber}`];
        return copy;
      });
    }
  }

  /* ---------- Save flows (cleaned and fixed) ---------- */
  async function saveWeekToBackend() {
    const blocked = weekDates.some(d => submittedMonthKeys.includes(monthKeyFromDate(d)));
    if (blocked) {
      setAlertState({ open: true, message: "One or more days in this week fall in a submitted month.", type: "info" });
      return;
    }

    const pid = selectedWeeklyProjectId;
    if (!pid) {
      setAlertState({ open: true, message: "Please select a project to save.", type: "info" });
      return;
    }

    const dayOverLimit = weekDates.find(d => {
      const iso = isoKey(d);
      const dailyKey = `D|${iso}|${pid}`;
      return Boolean(validationErrors[dailyKey]);
    });
    if (dayOverLimit) {
      setAlertState({ open: true, message: "Please fix validation errors (daily totals must not exceed 24h).", type: "info" });
      return;
    }

    setSaving(true);
    try {
      const p = projects.find(pp => String(pp.id) === String(pid));
      if (!p) {
        setAlertState({ open: true, message: "Selected project not found.", type: "info" });
        setSaving(false);
        return;
      }

      const entries = [];
      for (const d of weekDates) {
        const iso = isoKey(d);
        const tasksObj = weeklyEntries[iso]?.[String(pid)] ?? {};
        const tasksToUse = projectTasks.length ? projectTasks.map(t => t.taskName) : Object.keys(tasksObj);
        for (const t of tasksToUse) {
          const raw = weeklyEntries[iso]?.[String(pid)]?.[t];
          const hours = raw === "" || raw == null ? 0 : Number(raw);
          if (!hours || Number.isNaN(hours) || hours <= 0) continue;

          const taskObj = projectTasks.find(pt => (pt.taskName ?? "").toLowerCase() === String(t).toLowerCase()) ?? null;
          const taskId = taskObj ? taskObj.id : undefined;

          entries.push({
            entryDate: iso,
            description: `Task: ${t}`,
            hours: Number(Number(hours).toFixed(2)),
            rateAtEntry: p.hourlyRate ?? p.__raw?.hourlyRate ?? null,
            taskId
          });
        }
      }

      if (entries.length === 0) {
        setAlertState({ open: true, message: "No hours to save for the selected project.", type: "info" });
        setSaving(false);
        return;
      }

      const periodStart = isoKey(weekDates[0]);
      const periodEnd = isoKey(weekDates[weekDates.length - 1]);

      // get or create timesheet
      const timesheetRes = await timesheetsApi.getOrCreateTimesheet(pid, periodStart, periodEnd);
      const timesheet = normalizeAxiosData(timesheetRes) ?? timesheetRes;
      const tsObj = timesheet?.data ?? timesheet ?? timesheetRes;
      const tsId = tsObj?.id ?? tsObj?.timesheetId ?? tsObj?.timesheet_id ?? tsId;

      if (!tsId) throw new Error("No timesheet id");

      // try bulk upsert, fallback to per-entry create
      try {
        if (typeof timesheetsApi.bulkUpsertEntries === "function") {
          await timesheetsApi.bulkUpsertEntries(tsId, { mode: "UPSERT", entries });
        } else if (typeof timesheetsApi.bulkUpsert === "function") {
          await timesheetsApi.bulkUpsert(tsId, { mode: "UPSERT", entries });
        } else {
          for (const e of entries) {
            await timesheetsApi.createEntry({ ...e, timesheetId: tsId });
          }
        }
      } catch (bulkErr) {
        console.error("bulk upsert failed for weekly save", bulkErr?.response?.status, bulkErr?.response?.data);
        // fallback to per-entry creates
        for (const e of entries) {
          try {
            await timesheetsApi.createEntry({ ...e, timesheetId: tsId });
          } catch (perErr) {
            console.error("createEntry failed for", e, perErr?.response?.status, perErr?.response?.data);
          }
        }
      }

      // IMPORTANT:
      // After saving, refresh authoritative entries from the backend to avoid local double-counting
      await refreshEntriesForProjectPeriod(pid, periodStart, periodEnd);

      setAlertState({ open: true, message: "Saved", type: "success" });
      window.dispatchEvent(new Event("timeEntryCreated"));
    } catch (err) {
      console.error("Failed to save weekly entries:", err, err?.response?.status, err?.response?.data);
      setAlertState({ open: true, message: "Failed to save — see console.", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  /* ---------- Save month (silent option) and submit ---------- */
  async function saveMonthToBackend(options = { silent: false }) {
    const { silent } = options;

    if (submittedMonthKeys.includes(currentMonthKey)) {
      if (!silent) setAlertState({ open: true, message: "You already submitted hours for this month.", type: "info" });
      return false;
    }

    const pid = monthlySelectedProjectId;
    if (!pid) {
      if (!silent) setAlertState({ open: true, message: "Please select a project to save.", type: "info" });
      return false;
    }

    const monthInvalid = Object.keys(validationErrors).find(k => k.startsWith(`D|M|${pid}|`));
    if (monthInvalid) {
      if (!silent) setAlertState({ open: true, message: "Please fix validation errors before saving (daily totals must not exceed 24h).", type: "info" });
      return false;
    }

    setSaving(true);
    try {
      const p = projects.find(pp => String(pp.id) === String(pid));
      if (!p) {
        if (!silent) setAlertState({ open: true, message: "Selected project not found.", type: "info" });
        setSaving(false);
        return false;
      }

      const y = currentDate.getFullYear();
      const m = currentDate.getMonth();
      const first = new Date(y, m, 1);
      const last = new Date(y, m + 1, 0);
      const periodStart = isoKey(first);
      const periodEnd = isoKey(last);

      const entries = [];
      const daysObj = monthlyEntries[String(pid)] ?? {};
      for (const dayStr of Object.keys(daysObj)) {
        const dnum = Number(dayStr);
        const val = daysObj[dayStr];
        const hours = val === "" || val == null ? 0 : Number(val);
        if (!hours || Number.isNaN(hours) || hours <= 0) continue;
        const defaultTask = projectTasks.length ? projectTasks[0] : null;

        entries.push({
          entryDate: isoKey(new Date(y, m, dnum)),
          description: `Task: ${defaultTask ? (defaultTask.taskName ?? defaultTask.name) : "Work"}`,
          hours: Number(Number(hours).toFixed(2)),
          rateAtEntry: p.hourlyRate ?? p.__raw?.hourlyRate ?? null,
          taskId: defaultTask ? defaultTask.id : undefined
        });
      }

      if (entries.length === 0) {
        if (!silent) setAlertState({ open: true, message: "No hours to save for the selected project.", type: "info" });
        setSaving(false);
        return false;
      }

      const timesheetRes = await timesheetsApi.getOrCreateTimesheet(pid, periodStart, periodEnd);
      const timesheet = normalizeAxiosData(timesheetRes) ?? timesheetRes;
      const tsObj = timesheet?.data ?? timesheet ?? timesheetRes;
      const tsId = tsObj?.id ?? tsObj?.timesheetId ?? tsObj?.timesheet_id ?? tsId;

      if (!tsId) throw new Error("No timesheet id");

      try {
        if (typeof timesheetsApi.bulkUpsertEntries === "function") {
          await timesheetsApi.bulkUpsertEntries(tsId, { mode: "UPSERT", entries });
        } else if (typeof timesheetsApi.bulkUpsert === "function") {
          await timesheetsApi.bulkUpsert(tsId, { mode: "UPSERT", entries });
        } else {
          for (const e of entries) {
            await timesheetsApi.createEntry({ ...e, timesheetId: tsId });
          }
        }
      } catch (bulkErr) {
        console.error("bulk upsert failed for monthly save", bulkErr?.response?.status, bulkErr?.response?.data);
        // fallback to per-entry creates
        for (const e of entries) {
          try {
            await timesheetsApi.createEntry({ ...e, timesheetId: tsId });
          } catch (perErr) {
            console.error("createEntry failed for", e, perErr?.response?.status, perErr?.response?.data);
          }
        }
      }

      // After saving, refresh authoritative entries from backend (prevents double increments)
      await refreshEntriesForProjectPeriod(pid, periodStart, periodEnd);

      if (!silent) setAlertState({ open: true, message: "Saved", type: "success" });
      window.dispatchEvent(new Event("timeEntryCreated"));
      return true;
    } catch (err) {
      console.error("Failed to save monthly entries:", err, err?.response?.status, err?.response?.data);
      if (!silent) setAlertState({ open: true, message: "Failed to save — see console.", type: "error" });
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function submitMonthToBackend() {
    if (submittedMonthKeys.includes(currentMonthKey)) {
      setAlertState({ open: true, message: "You already submitted this month.", type: "info" });
      return;
    }

    setSaving(true);
    try {
      const ok = await saveMonthToBackend({ silent: true });
      if (!ok) {
        setAlertState({ open: true, message: "Failed to save prior to submit — see console.", type: "error" });
        return;
      }

      setSubmittedMonthKeys(prev => {
        if (prev.includes(currentMonthKey)) return prev;
        return [...prev, currentMonthKey];
      });

      setAlertState({ open: true, message: "Submitted", type: "success" });
      window.dispatchEvent(new Event("timeEntryCreated"));
    } catch (err) {
      console.error("Failed to submit month:", err, err?.response?.status, err?.response?.data);
      setAlertState({ open: true, message: "Failed to submit — see console.", type: "error" });
    } finally {
      setSaving(false);
      setShowSubmitModal(false);
    }
  }

  // Auto-select single project when only one exists:
  useEffect(() => {
    if (projects.length === 1) {
      const only = String(projects[0].id);
      setSelectedWeeklyProjectId(only);
      setMonthlySelectedProjectId(only);
    } else if (projects.length === 0) {
      setSelectedWeeklyProjectId("");
      setMonthlySelectedProjectId("");
    }
  }, [projects]);

  const anyLoading = loadingClients || loadingProjects || loadingTasks;
  if (anyLoading) return <div className="p-6">Loading…</div>;

  // Derived flags for button enable/disable
  const projectSelectedWeekly = projects.find(p => String(p.id) === String(selectedWeeklyProjectId));
  const projectSelectedMonthly = projects.find(p => String(p.id) === String(monthlySelectedProjectId));

  const projectSelectedWeeklyActive = Boolean(projectSelectedWeekly && projectSelectedWeekly.isActive !== false);
  const projectSelectedMonthlyActive = Boolean(projectSelectedMonthly && projectSelectedMonthly.isActive !== false);

  // weeklyNoTasks: when a project is selected but has no tasks
  const weeklyNoTasks = Boolean(selectedWeeklyProjectId) && projectTasks.length === 0;
  const monthlyNoTasks = Boolean(monthlySelectedProjectId) && projectTasks.length === 0;

  const noProjectsPresent = projects.length === 0;
  const weeklyHasValidationErrors = Object.keys(validationErrors).filter(k => k.startsWith("D|") || k.startsWith("W|")).length > 0;
  const monthlyHasValidationErrors = Object.keys(validationErrors).filter(k => k.startsWith("D|")).length > 0;

  const weeklySaveEnabled =
    !saving &&
    !weekDates.some(d => submittedMonthKeys.includes(monthKeyFromDate(d))) &&
    Boolean(selectedWeeklyProjectId) &&
    projectTasks.length > 0 &&
    !noProjectsPresent &&
    projectSelectedWeeklyActive &&
    !weeklyHasValidationErrors;

  const weeklyClearEnabled = !noProjectsPresent && Boolean(selectedWeeklyProjectId) && projectSelectedWeeklyActive;

  const monthlyButtonsEnabled =
    !saving &&
    !isCurrentMonthSubmitted &&
    !noProjectsPresent &&
    Boolean(monthlySelectedProjectId) &&
    projectTasks.length > 0 &&
    projectSelectedMonthlyActive &&
    !monthlyHasValidationErrors;

  const monthlyClearEnabled = !noProjectsPresent && Boolean(monthlySelectedProjectId) && projectSelectedMonthlyActive;

  // Color fallback
  const TASK_COLORS_FALLBACK = ["#2563eb", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-center">
        <div className="bg-gray-100 rounded-full p-1 inline-flex">
          <button
            onClick={() => setView("WEEKLY")}
            className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all ${view === "WEEKLY" ? "bg-white shadow text-gray-900" : "text-gray-600"}`}
          >
            <FiClock />
            <span className="font-medium">Weekly Entry</span>
          </button>

          <button
            onClick={() => setView("MONTHLY")}
            className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all ${view === "MONTHLY" ? "bg-white shadow text-gray-900" : "text-gray-600"}`}
          >
            <FiCalendar />
            <span className="font-medium">Monthly Entry</span>
          </button>
        </div>
      </div>

      {view === "WEEKLY" ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center w-full">
              <CardTitle>Weekly Time Entry</CardTitle>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => {
                  const d = new Date(currentDate);
                  d.setDate(currentDate.getDate() - 7);
                  setCurrentDate(d);
                }}>Prev</Button>
                <div className="text-sm">{shortMonthDay(weekDates[0])} - {shortMonthDay(weekDates[6])}</div>
                <Button variant="outline" size="sm" onClick={() => {
                  const d = new Date(currentDate);
                  d.setDate(currentDate.getDate() + 7);
                  setCurrentDate(d);
                }}>Next</Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="mb-3 flex items-center gap-3">
              <label className="font-medium">Project</label>

              {projects.length === 0 ? (
                <div className="text-sm text-gray-500">No projects</div>
              ) : projects.length === 1 ? (
                <div className="px-3 py-1 rounded border bg-white">{projects[0].name}</div>
              ) : (
                <select
                  value={selectedWeeklyProjectId}
                  onChange={(e) => setSelectedWeeklyProjectId(e.target.value)}
                  className="border px-3 py-1 rounded"
                >
                  <option value="">— Select project —</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name ?? p.projectName ?? p.code}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Weekly table */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="text-left p-3 w-56">Task</th>
                    {weekDates.map((d, i) => (
                      <th key={i} className="text-center p-3">
                        <div className="text-xs text-gray-500">{dayName(d)}</div>
                        <div className="text-xs text-gray-400">{d.getDate()}</div>
                      </th>
                    ))}
                    <th className="text-center p-3 w-24">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {weeklyNoTasks && (
                    <tr className="border-t bg-white">
                      <td colSpan={9} className="p-6 text-center text-gray-600">
                        <div className="text-lg font-semibold">No tasks available for this project.</div>
                        <div className="text-sm">Create tasks under Projects → Tasks or assign tasks to this project.</div>
                      </td>
                    </tr>
                  )}

                  {projectTasks.map((taskObj, ti) => {
                    const taskName = taskObj.taskName;
                    const color = TASK_COLORS_FALLBACK[ti % TASK_COLORS_FALLBACK.length];
                    return (
                      <tr key={taskObj.id ?? taskName} className="border-t">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <span style={{ backgroundColor: color }} className="w-3 h-3 rounded-full inline-block" />
                            <div className="font-medium">{taskName}</div>
                          </div>
                        </td>

                        {weekDates.map(d => {
                          const key = isoKey(d);
                          const pid = selectedWeeklyProjectId;
                          const val = pid ? (getWeeklyValue(key, pid, taskName) ?? "") : "";
                          const displayVal = pid ? (val || "") : "";
                          const cellMonthKey = monthKeyFromDate(d);
                          const disabled = !pid || submittedMonthKeys.includes(cellMonthKey) || noProjectsPresent || !projectSelectedWeeklyActive;
                          const errKey = pid ? makeWeeklyKey(key, pid, taskName) : null;
                          const hasError = errKey ? Boolean(validationErrors[errKey]) : false;
                          return (
                            <td className="p-2 text-center" key={`${taskName}-${key}`}>
                              <Input
                                type="number"
                                value={displayVal}
                                onChange={(e) => setWeeklyValue(key, pid, taskName, e.target.value)}
                                className={`mx-auto text-center ${hasError ? "border-red-500" : ""}`}
                                style={{ width: "3.5rem" }}
                                step="0.01"
                                min="0.01"
                                max="23.59"
                                disabled={disabled}
                              />
                            </td>
                          );
                        })}

                        <td className="p-3 text-center font-medium">
                          {selectedWeeklyProjectId
                            ? weekDates.reduce((s, d) => s + (Number(weeklyEntries[isoKey(d)]?.[String(selectedWeeklyProjectId)]?.[taskName]) || 0), 0).toFixed(2) + "h"
                            : "0.00h"}
                        </td>
                      </tr>
                    );
                  })}

                  <tr className="border-t">
                    <td className="p-3 font-medium">Daily Total</td>
                    {weekDates.map((d, i) => {
                      const iso = isoKey(d);
                      const total = selectedWeeklyProjectId ? computeDailyTotalForProjectAndIso(selectedWeeklyProjectId, iso) : 0;
                      const dailyErrKey = `D|${iso}|${selectedWeeklyProjectId}`;
                      const dailyError = Boolean(validationErrors[dailyErrKey]);
                      return (
                        <td key={i} className={`p-3 text-center font-medium ${dailyError ? "text-red-600" : ""}`}>
                          {Number(total).toFixed(2)}h
                        </td>
                      );
                    })}
                    <td className="p-3 text-center font-medium bg-gray-50">
                      {selectedWeeklyProjectId ? (weekDates.reduce((s, d) => s + computeDailyTotalForProjectAndIso(selectedWeeklyProjectId, isoKey(d)), 0).toFixed(2) + "h") : "0.00h"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  if (!selectedWeeklyProjectId) return;
                  setWeeklyEntries(prev => {
                    const copy = { ...prev };
                    for (const d of weekDates) {
                      const iso = isoKey(d);
                      if (!copy[iso]) continue;
                      delete copy[iso][String(selectedWeeklyProjectId)];
                    }
                    return copy;
                  });
                  setValidationErrors(prev => {
                    const copy = { ...prev };
                    for (const d of weekDates) {
                      for (const t of projectTasks.map(pt => pt.taskName)) delete copy[makeWeeklyKey(isoKey(d), selectedWeeklyProjectId, t)];
                    }
                    return copy;
                  });
                }}
                disabled={!weeklyClearEnabled}
                className={!weeklyClearEnabled ? "bg-gray-200 text-gray-500" : ""}
              >
                Clear
              </Button>

              <Button
                onClick={() => saveWeekToBackend()}
                disabled={!weeklySaveEnabled}
                className={!weeklySaveEnabled ? "bg-gray-200 text-gray-500" : "bg-green-600 text-white hover:bg-green-700"}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center w-full">
              <CardTitle>Monthly Time Entry</CardTitle>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => {
                  const d = new Date(currentDate);
                  d.setMonth(currentDate.getMonth() - 1);
                  setCurrentDate(d);
                }}>← Previous Month</Button>
                <div className="text-sm">{currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div>
                <Button variant="outline" size="sm" onClick={() => {
                  const d = new Date(currentDate);
                  d.setMonth(currentDate.getMonth() + 1);
                  setCurrentDate(d);
                }}>Next Month →</Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="max-w-full">
              <div className="mb-5 flex items-center gap-3">
                <label className="font-medium">Project</label>
                {!projects.length ? (
                  <div className="text-sm text-gray-500">No projects</div>
                ) : projects.length === 1 ? (
                  <div className="px-3 py-1 rounded border bg-white">{projects[0].name}</div>
                ) : (
                  <select
                    value={monthlySelectedProjectId}
                    onChange={(e) => setMonthlySelectedProjectId(e.target.value)}
                    className="border px-3 py-1 rounded"
                    disabled={isCurrentMonthSubmitted}
                  >
                    <option value="">— Select project —</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name ?? p.projectName ?? p.code}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-7 gap-5 text-center mb-3 text-sm font-medium">
                <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[600px] space-y-4">
                  {monthWeeks.map((week, wIdx) => (
                    <div key={wIdx} className="grid grid-cols-7 gap-5 items-start">
                      {week.map((d, dayIndex) => {
                        const inThisMonth = d.getMonth() === currentDate.getMonth();
                        const dayNumber = d.getDate();
                        return (
                          <div
                            key={dayIndex}
                            className={`p-1 min-h-[68px] rounded border flex flex-col items-center ${inThisMonth ? "bg-white" : "bg-gray-50/60"}`}
                          >
                            <div className="text-xs text-gray-500 text-center mb-2 w-full">
                              <div className="text-center">{inThisMonth ? dayNumber : ""}</div>
                            </div>

                            <div className="flex flex-col items-center gap-1 w-full">
                              {!inThisMonth ? (
                                <div className="text-xs text-gray-400">—</div>
                              ) : !monthlySelectedProjectId ? (
                                <input
                                  type="number"
                                  value={"0"}
                                  readOnly
                                  className="w-16 text-sm text-center py-1 rounded border bg-gray-50"
                                />
                              ) : (
                                (() => {
                                  const p = projects.find(pp => String(pp.id) === String(monthlySelectedProjectId));
                                  if (!p) return <div className="text-xs text-gray-400">—</div>;
                                  const iso = isoKey(d);

                                  // WEEKLY data is no longer used as fallback for monthly inputs.
                                  // Monthly inputs are authoritative for the month; monthlyEntries is used.
                                  const monthlyVal = monthlyEntries[String(p.id)]?.[String(dayNumber)];
                                  const displayVal = monthlyVal !== undefined && monthlyVal !== "" ? monthlyVal : "";

                                  const disabled = submittedMonthKeys.includes(currentMonthKey) || noProjectsPresent || !projectSelectedMonthlyActive;
                                  const errKey = makeMonthlyKey(p.id, dayNumber);
                                  const hasError = Boolean(validationErrors[errKey]);
                                  return (
                                    <input
                                      type="number"
                                      value={displayVal === undefined || displayVal === null ? "" : displayVal}
                                      onChange={(e) => setMonthlyValue(p.id, dayNumber, e.target.value)}
                                      className={`w-16 text-sm text-center py-1 rounded border ${hasError ? "border-red-500" : ""}`}
                                      placeholder="0"
                                      disabled={disabled}
                                      step="0.01"
                                      min="0.01"
                                      max="23.59"
                                    />
                                  );
                                })()
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t mt-4">
                <div className="text-lg font-semibold">Total Hours: {monthlySelectedProjectId ? Object.values(monthlyEntries[String(monthlySelectedProjectId)] || {}).reduce((s, v) => s + (Number(v) || 0), 0).toFixed(2) : "0.00"}</div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!monthlySelectedProjectId) return;
                      setMonthlyEntries(prev => {
                        const copy = { ...prev };
                        delete copy[String(monthlySelectedProjectId)];
                        return copy;
                      });
                      setValidationErrors(prev => {
                        const copy = { ...prev };
                        for (const k of Object.keys(copy)) {
                          if (k.startsWith(`M|${monthlySelectedProjectId}|`)) delete copy[k];
                        }
                        return copy;
                      });
                    }}
                    disabled={!monthlyClearEnabled}
                    className={!monthlyClearEnabled ? "bg-gray-200 text-gray-500" : ""}
                  >
                    Clear All
                  </Button>

                  <Button onClick={() => saveMonthToBackend()} disabled={!monthlyButtonsEnabled} className={!monthlyButtonsEnabled ? "bg-gray-200 text-gray-500" : "bg-green-600 text-white hover:bg-green-700"}>
                    {saving ? "Saving..." : "Save"}
                  </Button>

                  <Button onClick={() => { if (!monthlyButtonsEnabled) return; setShowSubmitModal(true); }} disabled={!monthlyButtonsEnabled} className={!monthlyButtonsEnabled ? "bg-gray-200 text-gray-500" : `${isCurrentMonthSubmitted ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"} text-white`}>
                    {isCurrentMonthSubmitted ? "Submitted" : "Submit"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit confirmation modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowSubmitModal(false)} />
          <div className="bg-white rounded-lg shadow-lg z-10 w-11/12 max-w-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Confirm submission</h3>
            <p className="mb-6">Once you submit the monthly hours, they will be locked and cannot be resubmitted. Do you want to submit?</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowSubmitModal(false)}>Cancel</Button>
              <Button onClick={() => submitMonthToBackend()} className="bg-indigo-600 text-white hover:bg-indigo-700">Confirm</Button>
            </div>
          </div>
        </div>
      )}

      {/* Alert modal */}
      {alertState.open && (
        <AlertModal
          open={alertState.open}
          onClose={() => setAlertState(prev => ({ ...prev, open: false }))}
          title={alertState.type === "error" ? "Error" : "Notice"}
          message={alertState.message}
          type={alertState.type}
        />
      )}
    </div>
  );
}
