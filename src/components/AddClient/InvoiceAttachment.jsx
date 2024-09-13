import React from 'react';

const InvoiceAttachment = ({ onClose }) => {
  return (
    <div className="mt-4 p-4 border-t border-gray-200">
      <div className="flex items-center space-x-2 mb-4">
        <input type="checkbox" id="attachPDF" className="h-4 w-4 text-blue-600" />
        <label htmlFor="attachPDF" className="text-gray-700">
          Add the option to attach a PDF copy when sending invoices by email.
        </label>
      </div>
      <p className="text-gray-500 text-sm mb-4">
        <span className="flex items-center">
          <span className="material-icons text-gray-400 mr-2">info</span>
          Changes will apply to new invoices
        </span>
      </p>
      <div className="flex justify-between">
        <button className="text-gray-700" onClick={onClose}>
          Cancel
        </button>
        <button className="bg-green-500 text-white py-2 px-4 rounded">Done</button>
      </div>
    </div>
  );
};

export default InvoiceAttachment;
