import React, { useState } from 'react';
import { FaBell, FaDollarSign, FaLanguage, FaPaperclip, FaChevronRight } from 'react-icons/fa';
import InvoiceAttachment from './InvoiceAttachment';

const NewClientForm = () => {
    const [showInvoiceAttachment, setShowInvoiceAttachment] = useState(false);
    const toggleInvoiceAttachment = () => setShowInvoiceAttachment (!showInvoiceAttachment);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">New Client</h1>
      <form className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Fields */}
        <div className="md:col-span-2 grid grid-cols-1 gap-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              className="p-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Last Name"
              className="p-2 border border-gray-300 rounded"
            />
          </div>
          <input
            type="text"
            placeholder="Company Name"
            className="p-2 border border-gray-300 rounded"
          />
          <input
            type="email"
            placeholder="Email Address"
            className="p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Phone Number"
            className="p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Business Phone Number"
            className="p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Mobile Phone Number"
            className="p-2 border border-gray-300 rounded"
          />
          <select className="p-2 border border-gray-300 rounded">
            <option>United States</option>
          </select>
          <input
            type="text"
            placeholder="Address Line 1"
            className="p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Address Line 2"
            className="p-2 border border-gray-300 rounded"
          />
          <div className="grid grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="City"
              className="p-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="State"
              className="p-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="ZIP Code"
              className="p-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        {/* Client Settings */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Client Settings</h2>
          <ul className="space-y-2">
            <li className="flex justify-between items-center py-2 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <FaBell className="text-gray-600" />
                <span>Send Reminders</span>
              </div>
              <button className="flex items-center text-gray-600 hover:text-gray-800">
                <span>No</span>
                <FaChevronRight className="ml-2" />
              </button>
            </li>
            <li className="flex justify-between items-center py-2 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <FaDollarSign className="text-gray-600" />
                <span>Charge Late Fees</span>
              </div>
              <button className="flex items-center text-gray-600 hover:text-gray-800">
                <span>No</span>
                <FaChevronRight className="ml-2" />
              </button>
            </li>
            <li className="flex justify-between items-center py-2 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <FaLanguage className="text-gray-600" />
                <span>Currency & Language</span>
              </div>
              <button className="flex items-center text-gray-600 hover:text-gray-800">
                <span>USD, English</span>
                <FaChevronRight className="ml-2" />
              </button>
            </li>
            <li className="flex justify-between items-center py-2 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <FaPaperclip className="text-gray-600" />
                <span>Invoice Attachments</span>
              </div>
              <button className="flex items-center text-gray-600 hover:text-gray-800">
                <span>No</span>
                <FaChevronRight className="ml-2" />
              </button>
            </li>
          </ul>
          {/* Render Invoice Attachments when clicked */}
          {showInvoiceAttachment && <InvoiceAttachment onClose={toggleInvoiceAttachment} />}
        </div>
      </form>

      {/* Action Buttons */}
      <div className="flex justify-end mt-4 space-x-4">
        <button className="bg-red-500 text-white py-2 px-4 rounded">Cancel</button>
        <button className="bg-green-500 text-white py-2 px-4 rounded">Save</button>
      </div>
    </div>
  );
};

export default NewClientForm;
