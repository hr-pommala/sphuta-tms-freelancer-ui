import React from 'react';

const ChargeLateFeesModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Charge Late Fees</h2>
        <div className="flex items-center space-x-2 mb-4">
          <input type="checkbox" id="chargeLateFees" className="h-4 w-4 text-blue-600" />
          <label htmlFor="chargeLateFees" className="text-gray-700">
            Automatically add late fees to this client’s overdue invoices.
          </label>
        </div>
        <p className="text-gray-500 text-sm mb-4">
          <span className="flex items-center">
            <span className="material-icons text-gray-400 mr-2">info</span>
            Changes will also apply to any new invoices
          </span>
        </p>
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

export default ChargeLateFeesModal;
