import React from 'react';
import Modal from 'react-modal';
import { SiStripe } from 'react-icons/si';
import PaymentIcons from './PaymentIcons';

function PaymentModal({isOpen, onRequestClose}) {
    return(
        <Modal isOpen={isOpen}
                onRequestCLose={onRequestClose}
                contentLabel= "Accept Online Pa"
                className="bg-white rounded-md p-6 max=w-md mx-auto m-24"
                overlayClassName="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Accept Online Payments</h2>
            <p className="mb-4">Start accepting online payments and let your clients pay through invoices.
            <a href="#" className="text-blue-500">See how</a></p>
            <div className="mb-4">
                <h3 className="text-lg font-bold flex items-center"><SiStripe className="mr-2 text-blue-500" /> Stripe
                <button className="bg-gray-300 text-black px-2 py-1 rounded-md ml-2">Connect</button></h3>
                <ul className="List-disc pl-5 mt-2">
                    <li>The easiest way to accept payments from clients online</li>
                    <li>Simple pricing with no hidden or monthly costs</li>
                    <li>Accept all major cards and currencies</li>
                </ul>
            </div>
            <div className="mb-4">
                <h3 className="text-Lg font-bold">Credit Cards</h3>
                <PaymentIcons/>
                <p className="mt-2">2.9% + $0.30 / transaction for most cards</p>
            </div>
            <div className="mb-4">
                <h3 className="text-lg font-bold">ACH Bank Transfers</h3>
                <p>1% per transaction</p>
            </div>
            <div className="mb-4">
                <h3 className="text-lg font-bold">Direct Debits</h3>
                <p>1%+€0.25 / transaction with a €10 cap</p>
            </div>
            <p className="text-sm mb-4"><a href="#" className="text-blue-500">Payments are safe and secures</a></p>
            <div className="flex justify-end space-x-4">
                <button className="bg-gray-300 text-black px-4 py-2 rounded-md" onClick={onRequestClose}>Cancel</button>
                <button className="bg-green-500 text-white px-4 py-2 rounded-md" >Done</button>
            </div>
        </Modal>
);
};

export default PaymentModal;