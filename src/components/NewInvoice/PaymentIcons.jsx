import React from 'react';
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcDiscover, FaCcPaypal, FaChevronRight } from 'react-icons/fa';
function PaymentIcons() {
    return (
        <div className="flex space-x-4 mt-6">
            <FaCcVisa size={20} className="text-blue-600" />
            <FaCcMastercard size={20} className="text-red-600" />
            <FaCcAmex size={20} className="text-blue-600" />
            <FaCcDiscover size={20} className="text-blue-400" />
            <FaCcPaypal size={20} className="text-orange-600" />
            <FaChevronRight className="text-gray-500" />
        </div>
    );
}

export default PaymentIcons;