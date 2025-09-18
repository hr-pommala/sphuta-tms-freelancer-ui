// src/components/Header.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import authApi from "../api/authApi"; // adjust path if needed

const Header = ({ toggleSidebar, isSidebarOpen, isDarkMode, setIsDarkMode }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Attempt to notify backend to revoke the token
      await authApi.logoutRequest();
    } catch (e) {
      // ignore errors — still clear client session
      console.warn("Logout request failed:", e);
    } finally {
      authApi.logout(); // clears localStorage
      navigate("/login");
    }
  };

  return (
    <header className={`flex items-center justify-between px-4 py-3 bg-blue-600 dark:bg-gray-900 text-white shadow-md fixed top-0 z-40 h-16 transition-all duration-300 w-full`}>
      {/* Left */}
      <div className={`flex items-center space-x-4 ${isSidebarOpen ? "ml-64" : "ml-16"} transition-all duration-300`}>
        <button className="text-2xl focus:outline-none" onClick={toggleSidebar} aria-label="Toggle Sidebar">
          <FiMenu />
        </button>
        <span className="text-xl font-bold">Dashboard</span>
      </div>

      {/* Center Search */}
      <div className="hidden md:flex mx-4 w-64 max-w-sm">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 rounded-full text-black focus:outline-none focus:ring-2 focus:ring-blue-300 dark:text-white dark:bg-gray-700 dark:focus:ring-gray-500"
            aria-label="Search"
          />
          <FiSearch className="absolute top-1/2 transform -translate-y-1/2 right-4 text-gray-500 dark:text-gray-300" />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-6">
        <button className="text-xl focus:outline-none" onClick={() => setIsDarkMode(!isDarkMode)} title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"} aria-pressed={isDarkMode}>
          {isDarkMode ? <FiSun /> : <FiMoon />}
        </button>

        <div className="relative" ref={notificationsRef}>
          <button className="text-xl focus:outline-none" title="Notifications" onClick={() => { setIsNotificationsOpen(s => !s); setIsProfileOpen(false); }} aria-expanded={isNotificationsOpen} aria-haspopup="true">
            <FiBell />
          </button>
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 bg-white text-black rounded-md shadow-lg w-64 dark:bg-gray-700 dark:text-white z-50">
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

        <div className="relative" ref={profileRef}>
          <button className="flex items-center space-x-2 focus:outline-none" title="Profile" onClick={() => { setIsProfileOpen(s => !s); setIsNotificationsOpen(false); }} aria-expanded={isProfileOpen} aria-haspopup="true">
            <FiUser />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 bg-white text-black rounded-md shadow-lg w-48 dark:bg-gray-700 dark:text-white z-50" role="menu">
              <ul className="p-2">
                <li className="py-2 px-4 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center space-x-2 cursor-pointer" role="menuitem" tabIndex={0} onClick={() => { console.log("Profile clicked"); setIsProfileOpen(false); }}>
                  <FiUser /> <span>Profile</span>
                </li>
                <li className="py-2 px-4 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center space-x-2 cursor-pointer" role="menuitem" tabIndex={0} onClick={() => { console.log("Settings clicked"); setIsProfileOpen(false); }}>
                  <FiSettings /> <span>Settings</span>
                </li>
                <li className="py-2 px-4 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center space-x-2 cursor-pointer" role="menuitem" tabIndex={0} onClick={() => { handleLogout(); setIsProfileOpen(false); }}>
                  <FiLogOut /> <span>Logout</span>
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
