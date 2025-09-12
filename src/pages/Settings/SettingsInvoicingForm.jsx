import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import invoicingApi from "../../api/Settingsinvoicing";

const initialForm = {
  userId: 0,
  currency: "USD",
  taxId: "",
  defaultTaxRate: 0.0,
  invoiceNumberFormat: "INV-${yyyy}${seq:5}",
  paymentTermsDays: 14,
  lateFeePercent: 0.0,
  templateId: "tmpl_default",
  logoFileId: "",
};

export default function SettingsInvoicingForm() {
  const { userId: paramUserId } = useParams();
  const isEdit = Boolean(paramUserId);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEdit) return;
    let mounted = true;
    (async () => {
      try {
        const res = await invoicingApi.getByUserId(paramUserId);
        const payload = res?.data ?? res;
        const dto = payload?.data ?? payload;
        if (!dto) throw new Error("No data returned for userId: " + paramUserId);
        if (!mounted) return;
        setForm({
          userId: parseInt(dto.userId, 10) || 0,
          currency: dto.currency || "USD",
          taxId: dto.taxId || "",
          defaultTaxRate: dto.defaultTaxRate ?? 0.0,
          invoiceNumberFormat: dto.invoiceNumberFormat || "INV-${yyyy}${seq:5}",
          paymentTermsDays: dto.paymentTermsDays ?? 14,
          lateFeePercent: dto.lateFeePercent ?? 0.0,
          templateId: dto.templateId || "tmpl_default",
          logoFileId: dto.logoFileId || "",
        });
      } catch (err) {
        console.error("Error loading settings:", err);
        const serverMsg = err.response?.data?.message ?? err.response?.data ?? err.message;
        setApiError(typeof serverMsg === "string" ? serverMsg : JSON.stringify(serverMsg));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [isEdit, paramUserId]);

  const validate = (values) => {
    const e = {};
    if (!values.userId && values.userId !== 0) e.userId = "User ID is required";
    else if (!Number.isInteger(values.userId) || values.userId < 1) e.userId = "User ID must be a positive integer";
    if (!values.currency) e.currency = "Currency is required";
    if (values.defaultTaxRate == null || values.defaultTaxRate < 0 || values.defaultTaxRate > 1) e.defaultTaxRate = "Tax rate must be between 0.0 and 1.0";
    if (!values.invoiceNumberFormat) e.invoiceNumberFormat = "Invoice number format required";
    if (values.paymentTermsDays == null || values.paymentTermsDays < 0) e.paymentTermsDays = "Payment terms must be >= 0";
    if (values.lateFeePercent == null || values.lateFeePercent < 0) e.lateFeePercent = "Late fee must be >= 0";
    if (!values.templateId) e.templateId = "Template ID required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    setSaving(true);
    try {
      const res = isEdit
        ? await invoicingApi.update(paramUserId, form)
        : await invoicingApi.create(form);

      const payload = res?.data ?? res;
      const dto = payload?.data ?? payload;
      navigate("/settings/invoicing");
    } catch (err) {
      console.error("Submit error:", err);
      const resp = err?.response?.data;
      let userMessage = "Unexpected error";
      if (!resp) {
        userMessage = err.message;
      } else if (typeof resp === "string") {
        userMessage = resp;
      } else if (resp.message) {
        userMessage = resp.message;
      } else if (resp.errors) {
        userMessage = Object.entries(resp.errors)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join("; ");
      } else if (resp.fieldErrors) {
        userMessage = resp.fieldErrors.map(fe => `${fe.field}: ${fe.message}`).join("; ");
      } else {
        userMessage = JSON.stringify(resp);
      }
      setApiError(userMessage);
    } finally {
      setSaving(false);
    }
  };

  const setVal = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl">
      <h2 className="text-xl font-semibold mb-4">{isEdit ? `Edit Settings Invoicing: ${paramUserId}` : "New Settings Invoicing"}</h2>
      {apiError && <div className="mb-4 text-red-600">Error: {apiError}</div>}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block text-sm font-medium">User ID</label>
          <input
            type="number"
            value={form.userId}
            onChange={(e) => setVal("userId", parseInt(e.target.value, 10) || 0)}
            className="mt-1 block w-full border rounded px-3 py-2"
            disabled={isEdit}
          />
          {errors.userId && <div className="text-red-600 text-sm">{errors.userId}</div>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Currency</label>
            <input value={form.currency} onChange={e=>setVal("currency", e.target.value)} className="mt-1 block w-full border rounded px-3 py-2"/>
            {errors.currency && <div className="text-red-600 text-sm">{errors.currency}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium">Tax ID</label>
            <input value={form.taxId} onChange={e=>setVal("taxId", e.target.value)} className="mt-1 block w-full border rounded px-3 py-2"/>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Default Tax Rate (0.0 - 1.0)</label>
            <input type="number" step="0.0001" min="0" max="1"
                   value={form.defaultTaxRate} onChange={e=>setVal("defaultTaxRate", parseFloat(e.target.value || 0))}
                   className="mt-1 block w-full border rounded px-3 py-2"/>
            {errors.defaultTaxRate && <div className="text-red-600 text-sm">{errors.defaultTaxRate}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium">Payment Terms (days)</label>
            <input type="number" min="0" value={form.paymentTermsDays} onChange={e=>setVal("paymentTermsDays", parseInt(e.target.value || 0))}
                   className="mt-1 block w-full border rounded px-3 py-2"/>
            {errors.paymentTermsDays && <div className="text-red-600 text-sm">{errors.paymentTermsDays}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium">Late Fee Percent</label>
            <input type="number" step="0.001" min="0" value={form.lateFeePercent} onChange={e=>setVal("lateFeePercent", parseFloat(e.target.value || 0))}
                   className="mt-1 block w-full border rounded px-3 py-2"/>
            {errors.lateFeePercent && <div className="text-red-600 text-sm">{errors.lateFeePercent}</div>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Invoice Number Format</label>
          <input value={form.invoiceNumberFormat} onChange={e=>setVal("invoiceNumberFormat", e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
          {errors.invoiceNumberFormat && <div className="text-red-600 text-sm">{errors.invoiceNumberFormat}</div>}
        </div>

        <div>
          <label className="block text-sm font-medium">Template ID</label>
          <input value={form.templateId} onChange={e=>setVal("templateId", e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
          {errors.templateId && <div className="text-red-600 text-sm">{errors.templateId}</div>}
        </div>

        <div>
          <label className="block text-sm font-medium">Logo File ID</label>
          <input value={form.logoFileId} onChange={e=>setVal("logoFileId", e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
        </div>

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={()=>navigate("/settings/invoicing")} className="px-4 py-2 border rounded">Cancel</button>
          <button disabled={saving} type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
            {saving ? "Saving..." : (isEdit ? "Update" : "Create")}
          </button>
        </div>
      </form>
    </div>
  );
}
