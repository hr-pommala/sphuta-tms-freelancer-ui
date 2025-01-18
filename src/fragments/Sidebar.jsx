import React, { useState } from "react";
import { Link } from "react-router-dom";
import { menuData } from "./MenuData";

const Sidebar = ({ isSidebarOpen }) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMenus = menuData
    .map((menu) => {
      const filteredSubmenus = menu.submenus.filter((submenu) =>
        submenu.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (
        menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        filteredSubmenus.length > 0
      ) {
        return { ...menu, submenus: filteredSubmenus };
      }
      return null;
    })
    .filter(Boolean);

  return (
    <aside
      className={`bg-gray-800 dark:bg-gray-900 text-white h-screen fixed top-0 left-0 z-50 transition-all duration-300 ${
        isSidebarOpen ? "w-64" : "w-16"
      }`}
    >
      {/* Search Bar */}
      <div className="p-4">
        {isSidebarOpen && (
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-4">
        {filteredMenus.map((menu, index) => (
          <div
            key={index}
            className="relative group"
            onMouseEnter={() => isSidebarOpen && setActiveMenu(index)}
            onMouseLeave={() => isSidebarOpen && setActiveMenu(null)}
          >
            <Link
              to={menu.component.toLowerCase()}
              className={`flex items-center cursor-pointer p-2 rounded hover:bg-blue-500 transition ${
                isSidebarOpen ? "justify-start space-x-4" : "justify-center"
              }`}
              onClick={() => !isSidebarOpen && setActiveMenu(activeMenu === index ? null : index)}
            >
              {menu.icon}
              {isSidebarOpen && <span>{menu.name}</span>}
            </Link>
            {(activeMenu === index || (!isSidebarOpen && activeMenu === index)) &&
              menu.submenus.length > 0 && (
                <div
                  className={`absolute ${
                    isSidebarOpen ? "left-full top-0" : "left-16 top-0"
                  } bg-gray-700 text-white rounded-md shadow-md w-48 p-2`}
                >
                  {menu.submenus.map((submenu, i) => (
                    <Link
                      key={i}
                      to={submenu.component.toLowerCase()}
                      className="block px-2 py-1 hover:bg-blue-500 rounded"
                    >
                      {submenu.name}
                    </Link>
                  ))}
                </div>
              )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
