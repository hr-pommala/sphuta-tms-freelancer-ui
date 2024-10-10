import React from 'react';
import { FaBars } from 'react-icons/fa';

const Header = ({ toggleSidebar }) => {
  return (
    <div className="flex justify-between bg-white p-4 shadow">
      {/* Three-bar icon (Hamburger menu) to toggle the sidebar */}
      <button
        className="text-lg font-semibold flex items-center"
        onClick={toggleSidebar}
      >
        <FaBars className="mr-2" /> {/* Hamburger icon */}
        Sample Company
      </button>
      <div className="text-gray-600">Contact experts</div>
    </div>
  );
};

export default Header;
