import React, { useState } from "react";
import { Link } from "react-router-dom";
import menuData from "../json/menuData.json";
import logo from "../assets/logo.jpeg";
import NotificationBell from "./NotificationBell";

const Header = () => {
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  const handleMouseEnter = (label) => {
    setActiveSubmenu(label); // Set the active submenu when hovering
  };

  const handleMouseLeave = () => {
    setActiveSubmenu(null); // Reset when not hovering
  };

  const renderSubmenu = (submenu, parentLabel) => {
    return (
      <ul
        className={`absolute left-full top-0 ${
          activeSubmenu === parentLabel ? "flex" : "hidden"
        } flex-col bg-white text-black shadow-lg border z-50`}
        onMouseLeave={handleMouseLeave}
      >
        {submenu.map((item, index) => (
          <li key={index}>
            <Link
              to={item.component === "Home" ? "/" : `/${item.component.toLowerCase()}`}
              className="block px-4 py-2 hover:bg-gray-100 whitespace-nowrap"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    );
  };

  const renderMenu = (menuData) => {
    return menuData.map((item, index) => (
      <li
        key={index}
        className="relative group"
        onMouseEnter={() => handleMouseEnter(item.label)}
        onMouseLeave={handleMouseLeave}
      >
        <Link
          to={`/${item.component.toLowerCase()}`}
          className="hover:underline px-4 py-2 block"
        >
          {item.label}
        </Link>
        {item.submenu && (
          <ul
            className={`absolute left-0 top-full hidden group-hover:flex flex-col bg-white text-black shadow-lg border z-50`}
          >
            {item.submenu.map((subItem, subIndex) => (
              <li
                key={subIndex}
                className="relative group"
                onMouseEnter={() => handleMouseEnter(subItem.label)}
              >
                <Link
                  to={`/${subItem.component.toLowerCase()}`}
                  className="block px-4 py-2 hover:bg-gray-100 whitespace-nowrap"
                >
                  {subItem.label}
                </Link>
                {/* Render 3rd submenu if exists */}
                {subItem.submenu &&
                  renderSubmenu(subItem.submenu, subItem.label)}
              </li>
            ))}
          </ul>
        )}
      </li>
    ));
  };

  return (
    <header className="flex justify-between items-center bg-blue-600 text-white p-4 shadow">
      {/* Logo */}
      <div className="flex items-center space-x-4">
          <img
            src={logo}
            alt="Company Logo"
            className="h-10 w-auto sm:h-12 md:h-14 lg:h-16 object-contain"
          />
      </div>
      {/* Horizontal Menu */}
      <nav>
        <ul className="flex space-x-4">{renderMenu(menuData)}</ul>
      </nav>
      {/* Notification Bell */}
      <div className="ml-4">
        <NotificationBell />
      </div>
    </header>
  );
};

export default Header;
