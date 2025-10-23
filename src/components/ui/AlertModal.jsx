import React from "react";
import Modal from "./Modal";

export default function AlertModal({ open, title = "Alert", message, onClose }) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="text-sm text-gray-700 mb-4">{message}</div>
      <div className="flex justify-end">
        <button onClick={onClose} className="px-4 py-2 rounded bg-blue-600 text-white">OK</button>
      </div>
    </Modal>
  );
}

