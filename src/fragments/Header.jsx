import React, { useState } from "react";
import {
  FiMenu,
  FiSearch,
  FiBell,
  FiUser,
  FiSun,
  FiMoon,
  FiLogOut,
  FiSettings,
} from "react-icons/fi";

const Header = ({ toggleSidebar, isSidebarOpen, isDarkMode, setIsDarkMode }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header
      className={`flex items-center justify-between px-4 py-3 bg-blue-600 dark:bg-gray-900 text-white shadow-md fixed top-0 z-40 h-16 transition-all duration-300 w-full ${
        isSidebarOpen ? "pl-64" : "pl-16"
      }`} // Add padding-left to ensure header respects sidebar width
    >
      {/* Left: Sidebar Toggle and Logo */}
      <div className="flex items-center space-x-4">
        <button
          className="text-2xl focus:outline-none"
          onClick={toggleSidebar} // Toggles the sidebar
          aria-label="Toggle Sidebar"
        >
          <FiMenu />
        </button>
        <span className="text-xl font-bold">Dashboard</span>
      </div>

      {/* Center: Search Bar */}
      <div className="hidden md:flex mx-4 w-64 max-w-sm">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 rounded-full text-black focus:outline-none focus:ring-2 focus:ring-blue-300 dark:text-white dark:bg-gray-700 dark:focus:ring-gray-500"
          />
          <FiSearch className="absolute top-1/2 transform -translate-y-1/2 right-4 text-gray-500 dark:text-gray-300" />
        </div>
      </div>

      {/* Right: Action Icons */}
      <div className="flex items-center space-x-6">
        {/* Theme Toggle */}
        <button
          className="text-xl focus:outline-none"
          onClick={() => setIsDarkMode(!isDarkMode)}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <FiSun /> : <FiMoon />}
        </button>

        {/* Notifications */}
        <div
          className="relative"
          onMouseEnter={() => setIsNotificationsOpen(true)}
          onMouseLeave={() => setIsNotificationsOpen(false)}
        >
          <button className="text-xl focus:outline-none" title="Notifications">
            <FiBell />
          </button>
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 bg-white text-black rounded-md shadow-lg w-64 dark:bg-gray-700 dark:text-white">
              <div className="p-4 border-b dark:border-gray-600">
                <h3 className="font-bold text-lg">Notifications</h3>
              </div>
              <ul className="p-4 space-y-2">
                <li className="flex items-center space-x-2">
                  <span className="text-blue-500 font-bold">New</span>
                  <span>You have a new message.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-blue-500 font-bold">Reminder</span>
                  <span>Project deadline is tomorrow.</span>
                </li>
              </ul>
              <div className="p-4 text-center border-t dark:border-gray-600">
                <button className="text-blue-500 hover:underline">View All</button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div
          className="relative"
          onMouseEnter={() => setIsProfileOpen(true)}
          onMouseLeave={() => setIsProfileOpen(false)}
        >
          <button
            className="flex items-center space-x-2 focus:outline-none"
            title="Profile"
          >
            <FiUser />
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 bg-white text-black rounded-md shadow-lg w-48 dark:bg-gray-700 dark:text-white">
              <ul className="p-2">
                <li className="py-2 px-4 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center space-x-2">
                  <FiUser />
                  <span>Profile</span>
                </li>
                <li className="py-2 px-4 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center space-x-2">
                  <FiSettings />
                  <span>Settings</span>
                </li>
                <li className="py-2 px-4 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center space-x-2">
                  <FiLogOut />
                  <span>Logout</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
