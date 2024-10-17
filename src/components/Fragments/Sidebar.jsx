import React, { useState } from 'react';
import { FaTachometerAlt, FaChartLine, FaMoneyBillWave, FaUsers, FaDollarSign, FaClock, FaCalculator,
    FaChevronRight, FaChevronDown, FaCogs, FaShoppingCart, FaUniversity, FaFileInvoice } from 'react-icons/fa'; // Importing icons

const Sidebar = ({ menuData, onSubMenuClick, userName, logoUrl }) => {
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

//Mapping dynamic menu list to their respective icons
  const dynamicMenus = [
    { name: 'App', icon: <FaCogs /> },
    { name: 'Team Members', icon: <FaUsers /> },
    { name: 'Items and Services', icon: <FaShoppingCart /> },
    { name: 'Bank Connections', icon: <FaUniversity /> },
    { name: 'Settings', icon: <FaFileInvoice /> }
  ];

  return (
    <div className="w-64 bg-custom-blue text-white h-full flex flex-col justify-between overflow-auto">
      {/* Section 1: Company Logo and User Name */}
        <div className="p-4 border-b border-gray-600">
          <div className="flex items-center justify-start mb-4">
            <img src={logoUrl} alt="" className="w-12 h-12 mr-2" />
            <span className="text-xl font-bold">{userName}</span>
          </div>
        </div>
      {/* Section 2: Main Menus */}
        <div className="flex-grow border-b border-gray-600">
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
        {/* Section 3: Dynamic Menus (Settings and Apps) */}
          <div className="p-4 border-b border-gray-600">
            <h3 className="text-gray-400 font-semibold mb-2">Settings & Apps</h3>
            <ul>
              {dynamicMenus.map((menu, index) => (
                <li
                  key={index}
                  className="hover:bg-gray-700 px-4 py-2 cursor-pointer flex items-center"
                  onClick={() => onSubMenuClick(menu.name)}
                >
                <span className="mr-2">{menu.icon}</span> {/* Icon here */}
                  {menu.name}
                </li>
              ))}
            </ul>
          </div>
        {/* Section 4: Footer Logo */}
          <div className="p-4 border-b border-gray-600">
            <img src={logoUrl} alt="" className="w-12 h-12 mx-auto" />
          </div>

    </div>
  );
};

export default Sidebar;
