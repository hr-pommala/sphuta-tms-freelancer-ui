import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiHome,
  FiUser,
  FiSettings,
  FiLogOut,
  FiBarChart2,
  FiFolder,
  FiMail,
} from "react-icons/fi";

const Sidebar = ({ isSidebarOpen }) => {
  const [activeMenu, setActiveMenu] = useState(null); // Tracks the active menu for hover/click
  const [collapsedSubmenu, setCollapsedSubmenu] = useState(null); // Tracks the clicked submenu in collapsed mode

  const menus = [
    {
      name: "Dashboard",
      icon: <FiHome />,
      route: "/dashboard",
      submenus: [
        { name: "Overview", route: "/dashboard/overview" },
        { name: "Analytics", route: "/dashboard/analytics" },
        { name: "Reports", route: "/dashboard/reports" },
      ],
    },
    {
      name: "Projects",
      icon: <FiFolder />,
      route: "/projects",
      submenus: [
        { name: "Active", route: "/projects/active" },
        { name: "Archived", route: "/projects/archived" },
      ],
    },
    {
      name: "Messages",
      icon: <FiMail />,
      route: "/messages",
      submenus: [
        { name: "Inbox", route: "/messages/inbox" },
        { name: "Sent", route: "/messages/sent" },
      ],
    },
    {
      name: "Settings",
      icon: <FiSettings />,
      route: "/settings",
      submenus: [
        { name: "Profile", route: "/settings/profile" },
        { name: "Account", route: "/settings/account" },
      ],
    },
    {
      name: "Logout",
      icon: <FiLogOut />,
      route: "/logout",
      submenus: [],
    },
  ];

  const handleMenuClick = (index) => {
    if (!isSidebarOpen) {
      setCollapsedSubmenu(collapsedSubmenu === index ? null : index); // Toggle submenu in collapsed mode
    }
  };

  const handleMouseEnter = (index) => {
    if (isSidebarOpen) {
      setActiveMenu(index); // Show submenu on hover in expanded mode
    }
  };

  const handleMouseLeave = () => {
    if (isSidebarOpen) {
      setActiveMenu(null); // Hide submenu when leaving the menu in expanded mode
    }
  };

  return (
    <aside
      className={`bg-gray-800 text-white h-full fixed top-16 transition-all duration-300 ${
        isSidebarOpen ? "w-64" : "w-16"
      }`}
    >
      <nav className="p-4 space-y-4">
        {menus.map((menu, index) => (
          <div
            key={index}
            className="relative group"
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            {/* Main Menu Item */}
            <div
              className={`flex items-center cursor-pointer p-2 rounded hover:bg-blue-500 transition ${
                isSidebarOpen ? "justify-start space-x-4" : "justify-center"
              }`}
              onClick={() => handleMenuClick(index)}
            >
              {menu.icon}
              {isSidebarOpen && <span>{menu.name}</span>}
            </div>

            {/* Submenu */}
            {(activeMenu === index || (!isSidebarOpen && collapsedSubmenu === index)) &&
              menu.submenus.length > 0 && (
                <div
                  className={`absolute ${
                    isSidebarOpen ? "left-full top-0" : "left-16 top-0"
                  } bg-gray-700 text-white rounded-md shadow-md w-48 p-2`}
                >
                  {menu.submenus.map((submenu, i) => (
                    <Link
                      key={i}
                      to={submenu.route}
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
