import React, { useState } from 'react';

const Sidebar = ({ menuData, onSubMenuClick }) => {
  // State to track which main menu item is expanded
  const [expandedMenu, setExpandedMenu] = useState(null);

  // Toggle submenu visibility
  const toggleMenu = (menuKey) => {
    setExpandedMenu(expandedMenu === menuKey ? null : menuKey);
  };

  return (
    <div className="w-64 bg-gray-800 text-white h-full">
      <ul>
        {Object.keys(menuData).map((key) => (
          <li key={key} className="mt-4">
            {/* Main Menu Item */}
            <div
              className="font-semibold text-lg text-gray-300 px-4 cursor-pointer flex justify-between items-center"
              onClick={() => toggleMenu(key)}
            >
              {key}
              {/* Arrow indicator */}
              <span>{expandedMenu === key ? '▼' : '▶'}</span>
            </div>

            {/* Submenu - displayed only if the parent menu is clicked */}
            {expandedMenu === key && (
              <ul>
                {menuData[key].map((item, index) => (
                  <li
                    key={index}
                    className="hover:bg-gray-700 px-4 py-2 cursor-pointer"
                    onClick={() => onSubMenuClick(item)}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
