import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { menuData } from "./MenuData";

const Sidebar = ({ isSidebarOpen }) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null); // To handle delayed submenu hiding
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState("w-16"); // Default sidebar width
  const sidebarRef = useRef();

  useEffect(() => {
    if (isSidebarOpen && sidebarRef.current) {
      // Calculate the longest menu item's text width dynamically
      const maxTextWidth = Array.from(
        sidebarRef.current.querySelectorAll(".menu-text")
      )
        .map((text) => text.offsetWidth)
        .reduce((max, width) => Math.max(max, width), 0);
      setSidebarWidth(`w-[${maxTextWidth + 80}px]`); // Add padding for icon and spacing
    } else {
      setSidebarWidth("w-16"); // Collapsed state
    }
  }, [isSidebarOpen]);

  // Filter menus based on the search query
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

  const handleMouseEnter = (index) => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setActiveMenu(index); // Show submenu
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setActiveMenu(null); // Hide submenu after delay
    }, 300); // 300ms delay
    setHoverTimeout(timeout);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  }, [hoverTimeout]);

  return (
    <aside
      ref={sidebarRef}
      className={`h-screen fixed top-0 left-0 z-50 transition-all duration-300 ${sidebarWidth} bg-blue-600 dark:bg-gray-900 text-white shadow-lg`}
    >
      {/* Search Bar */}
      <div className="p-4">
        {isSidebarOpen && (
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-3 py-2 rounded bg-blue-700 dark:bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-gray-500"
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
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            {/* Main Menu Item */}
            <Link
              to={menu.component.toLowerCase()}
              className={`flex items-center cursor-pointer p-2 rounded transition ${
                isSidebarOpen
                  ? "hover:bg-blue-700 dark:hover:bg-gray-800 justify-start space-x-4"
                  : "hover:bg-blue-700 dark:hover:bg-gray-800 justify-center"
              }`}
            >
              {menu.icon}
              {isSidebarOpen && (
                <span className="menu-text">{menu.name}</span> // Add class for dynamic width calculation
              )}
            </Link>

            {/* Submenu Dropdown */}
            {activeMenu === index && menu.submenus.length > 0 && (
              <div
                className={`absolute ${
                  isSidebarOpen ? "left-full top-0" : "left-12 top-0"
                } bg-blue-700 dark:bg-gray-800 text-white rounded-md shadow-lg w-48 p-2`}
                onMouseEnter={() => handleMouseEnter(index)} // Keep submenu open
                onMouseLeave={handleMouseLeave}
              >
                {menu.submenus.map((submenu, i) => (
                  <Link
                    key={i}
                    to={submenu.component.toLowerCase()}
                    className="block px-2 py-1 hover:bg-blue-500 dark:hover:bg-gray-700 rounded"
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
