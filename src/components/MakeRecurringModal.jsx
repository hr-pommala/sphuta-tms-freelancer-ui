import React from 'react';
import Modal from 'react-modal';
import { FaCheck } from 'react-icons/fa';
import PaymentIcons from './PaymentIcons';

function MakeRecurringModal({ isOpen, onRequestClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Make Recurring"
      className="bg-white rounded-md p-6 max-w-md mx-auto mt-24"
      overlayClassName="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 overflow-y-auto" >

          <h2 className="text-xl font-bold mb-4">Make Recurring</h2>
          <p className="mb-4">Create a recurring invoice for your client and get paid automatically. </p>
          <div className="mb-4">
              <p className="mb-4 flex items-center">
              <FaCheck className="text-green-500 mr-2" />
              Save time by automatically creating invoices from a template</p>
          </div>
          <div className="mb-4">
              <p className="mb-4 flex items-center">
              <FaCheck className="text-green-500 mr-2" />
              Customize how often invoices are created</p>
          </div>
          <div className="mb-4">
              <p className="mb-4 flex items-center">
              <FaCheck className="text-green-500 mr-2" />
              Allow clients to pay automatically by saving their credit card</p>
          </div>
          <PaymentIcons/>
          <div className="flex justify-end space-x-4">
              <button className="bg-gray-300 text-black px-4 py-2 rounded-ma" onClick={onRequestClose}>Cancel</button>
              <button className="bg-green-500 text-white px-4 py-2 rounded-md">Make Recurring</button>
          </div>
    </Modal>
  );
};

export default MakeRecurringModal;
