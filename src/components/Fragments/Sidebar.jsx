import React, { useState } from 'react';
import { FaTachometerAlt, FaChartLine, FaMoneyBillWave, FaUsers, FaDollarSign, FaClock, FaCalculator, FaChevronRight, FaChevronDown } from 'react-icons/fa'; // Importing icons

const Sidebar = ({ menuData, onSubMenuClick }) => {
  // State to track which main menu item is expanded
  const [expandedMenu, setExpandedMenu] = useState(null);

  // Toggle submenu visibility
  const toggleMenu = (menuKey) => {
    setExpandedMenu(expandedMenu === menuKey ? null : menuKey);
  };

  // Mapping main menu items to their respective icons
  const menuIcons = {
    "Dashboards": <FaTachometerAlt />,
    "Sales": <FaChartLine />,
    "Expenses": <FaMoneyBillWave />,
    "Customers & Leads": <FaUsers />,
    "Payroll": <FaDollarSign />,
    "Time": <FaClock />,
    "Budgets": <FaCalculator />
  };

  return (
    <div className="w-64 bg-custom-blue text-white h-full">
      <ul>
        {Object.keys(menuData).map((key) => (
          <li key={key} className="mt-4">
            {/* Main Menu Item */}
            <div
              className="font-semibold text-lg text-gray-300 px-4 cursor-pointer flex justify-between items-center"
              onClick={() => toggleMenu(key)}
            >
              <div className="flex items-center">
                {/* Icon next to the menu item */}
                <span className="mr-2">
                  {menuIcons[key]} {/* Icon for each menu item */}
                </span>
                {key}
              </div>
              {/* Arrow indicator */}
              <span></span>
                  {expandedMenu === key ? (
                  <FaChevronDown className="text-gray-500" />
                  ) :
                  (
                      <FaChevronRight className="text-gray-500" />
                      )}
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
