import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import invoicingApi from "../../api/Settingsinvoicing";

export default function SettingsInvoicingView() {
  const { userId } = useParams();
  const [dto, setDto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await invoicingApi.getByUserId(userId);
        const data = (res.data && res.data.data) ? res.data.data : res.data;
        setDto(data);
      } catch (e) {
        setErr(e.response?.data?.message || e.message);
      } finally { setLoading(false); }
    })();
  }, [userId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;
  if (!dto) return <div className="p-6">No data</div>;

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold"> Settings Invoicing — {dto.userId}</h2>
        <div className="flex gap-2">
{/*             for cancel button, go back to list view */}
             <button onClick={() => navigate("/settings/invoicing")} className="px-3 py-1 border rounded">Cancel</button>
          <button onClick={() => navigate(`/settings/invoicing/edit/${dto.userId}`)} className="px-3 py-1 bg-yellow-500 text-white rounded">Edit</button>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-gray-500">Currency</div>
          <div className="font-medium">{dto.currency}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Tax ID</div>
          <div className="font-medium">{dto.taxId || "-"}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Default Tax Rate</div>
          <div className="font-medium">{dto.defaultTaxRate}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Late Fee Percent</div>
          <div className="font-medium">{dto.lateFeePercent}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Payment Terms (days)</div>
          <div className="font-medium">{dto.paymentTermsDays}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Template ID</div>
          <div className="font-medium">{dto.templateId}</div>
        </div>
        <div className="md:col-span-2">
          <div className="text-xs text-gray-500">Invoice Number Format</div>
          <div className="font-medium">{dto.invoiceNumberFormat}</div>
        </div>
        <div className="md:col-span-2">
          <div className="text-xs text-gray-500">Logo File ID</div>
          <div className="font-medium">{dto.logoFileId || "-"}</div>
        </div>
      </div>
    </div>
  );
}
