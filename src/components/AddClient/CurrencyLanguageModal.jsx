import React from 'react';

const CurrencyLanguageModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Currency & Language</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Choose a Language</label>
          <select className="w-full p-2 border rounded">
            <option>English (United States)</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Choose a Currency</label>
          <select className="w-full p-2 border rounded">
            <option>USD — US dollar</option>
            <option>EUR — Euro</option>
            <option>GBP — British pound</option>
          </select>
        </div>
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

export default CurrencyLanguageModal;
