import React from "react";

export default function Drawer({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full sm:w-96 bg-white p-4 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">{title}</div>
          <button onClick={onClose} className="px-2 py-1">Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}
