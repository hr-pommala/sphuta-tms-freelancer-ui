import React, { useState } from 'react';

const LeftSideMenu = () => {
  // Sample JSON data
  const [menuData, setMenuData] = useState({
    "Product": ["Payroll", "Book Keeping", "Time Tracking"],
    "Features": ["Invoice", "Track Expense", "Manage Bills"]
  });

  // State to track which key is hovered
  const [hoveredKey, setHoveredKey] = useState(null);

  return (
    <div className="flex">
      {/* Left Sidebar */}
      <div className="w-64 h-full bg-gray-800 text-white relative">
        <ul>
          {Object.keys(menuData).map((key) => (
            <li
              key={key}
              className="mt-4 relative"
              onMouseEnter={() => setHoveredKey(key)}
              onMouseLeave={() => setHoveredKey(null)}
            >
              {/* Main Menu Item */}
              <div className="font-semibold text-lg text-gray-300 px-4 cursor-pointer">
                {key}
              </div>

              {/* Submenu - displayed on hover */}
              {hoveredKey === key && (
                <ul className="absolute left-64 top-0 bg-gray-700 text-white shadow-lg w-48">
                  {menuData[key].map((item, index) => (
                    <li key={index} className="hover:bg-gray-600 px-4 py-2 cursor-pointer">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LeftSideMenu;
