import React, { useState } from 'react';
import { FaBell, FaDollarSign, FaLanguage, FaPaperclip, FaChevronRight } from 'react-icons/fa';
import InvoiceAttachments from './InvoiceAttachments';
import SendRemindersModal from './SendRemindersModal';
import CurrencyLanguageModal from './CurrencyLanguageModal';
import ChargeLateFeesModal from './ChargeLateFeesModal';

const NewClientForm = () => {
    const [showInvoiceAttachments, setShowInvoiceAttachments] = useState(false);
    const [showSendReminders, setShowSendReminders] = useState(false);
    const [showCurrencyLanguage, setShowCurrencyLanguage] = useState(false);
    const [showChargeLateFees, setShowChargeLateFees] = useState(false);

    const handleCloseAllModals = () => {
        setShowInvoiceAttachments(false);
        setShowSendReminders(false);
        setShowCurrencyLanguage(false);
        setShowChargeLateFees(false);
    };

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
            <li
              className="flex justify-between items-center py-2 border-b border-gray-200 cursor-pointer"
              onClick={() => setShowSendReminders(true)}
            >
              <div className="flex items-center space-x-2">
                <FaBell className="text-gray-600" />
                <span>Send Reminders</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>No</span>
                <FaChevronRight className="text-gray-600" />
              </div>
            </li>
            <li
              className="flex justify-between items-center py-2 border-b border-gray-200 cursor-pointer"
              onClick={() => setShowChargeLateFees(true)}
            >
              <div className="flex items-center space-x-2">
                <FaDollarSign className="text-gray-600" />
                <span>Charge Late Fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>No</span>
                <FaChevronRight className="text-gray-600" />
              </div>
            </li>
            <li
              className="flex justify-between items-center py-2 border-b border-gray-200 cursor-pointer"
              onClick={() => setShowCurrencyLanguage(true)}
            >
              <div className="flex items-center space-x-2">
                <FaLanguage className="text-gray-600" />
                <span>Currency & Language</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>USD, English</span>
                <FaChevronRight className="text-gray-600" />
              </div>
            </li>
            <li
              className="flex justify-between items-center py-2 border-b border-gray-200 cursor-pointer"
              onClick={() => setShowInvoiceAttachments(true)}
            >
              <div className="flex items-center space-x-2">
                <FaPaperclip className="text-gray-600" />
                <span>Invoice Attachments</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>No</span>
                <FaChevronRight className="text-gray-600" />
              </div>
            </li>
          </ul>
        </div>
      </form>

      {/* Modals */}
      {showSendReminders && <SendRemindersModal onClose={handleCloseAllModals} />}
      {showCurrencyLanguage && <CurrencyLanguageModal onClose={handleCloseAllModals} />}
      {showChargeLateFees && <ChargeLateFeesModal onClose={handleCloseAllModals} />}
      {showInvoiceAttachments && <InvoiceAttachments onClose={handleCloseAllModals} />}
    </div>
  );
};

export default NewClientForm;
