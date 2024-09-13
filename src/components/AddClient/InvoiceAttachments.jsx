import React from 'react';

const InvoiceAttachments = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Invoice Attachments</h2>
        <p className="text-gray-700 mb-4">
          This section is for attaching invoice-related files.
        </p>
        {/* Add input fields or other UI elements as needed */}
        <input type="file" className="mb-4" />
        <div className="flex justify-between">
          <button className="text-gray-700" onClick={onClose}>
            Cancel
          </button>
          <button className="bg-green-500 text-white py-2 px-4 rounded" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceAttachments;
