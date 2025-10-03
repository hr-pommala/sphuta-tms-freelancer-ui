// src/fragments/Header.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiSearch,
} from "react-icons/fi";
import {
  SunIcon,
  MoonIcon,
  UserIcon,
  CogIcon,
  ArrowRightIcon,
} from "@heroicons/react/outline";
import authApi from "../api/authApi"; // adjust path if needed
import NotificationBell from "../components/NotificationBell";

const Header = ({ toggleSidebar, isSidebarOpen, isDarkMode, setIsDarkMode }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") {
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
    <header className={`flex justify-between items-center bg-[#06d6a0] text-white p-4 shadow fixed top-0 right-0 left-0 z-40 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}>
      {/* Left: Logo and app name */}
      <div className="flex items-center gap-4 pl-2 min-w-[150px]">
        {/* Optionally add a logo here */}
        <span className="font-bold text-xl whitespace-nowrap text-white drop-shadow-sm">Sphuta TMS</span>
      </div>

      {/* Center: (optional) search or menu */}
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

      {/* Right: Notification bell and profile */}
      <div className="flex items-center gap-4">
        <NotificationBell />
        <button
          className="p-2 rounded-full hover:bg-gray-200 focus:outline-none"
          onClick={() => setIsDarkMode((v) => !v)}
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? (
            <SunIcon className="h-6 w-6 text-yellow-500" />
          ) : (
            <MoonIcon className="h-6 w-6 text-gray-700" />
          )}
        </button>
        <div className="relative" ref={profileRef}>
          <button className="flex items-center space-x-2 focus:outline-none" title="Profile" onClick={() => setIsProfileOpen(s => !s)} aria-expanded={isProfileOpen} aria-haspopup="true">
            <UserIcon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 bg-white text-black rounded-md shadow-lg w-48 dark:bg-gray-700 dark:text-white z-50" role="menu">
              <ul className="p-2">
                <li className="py-2 px-4 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center space-x-2 cursor-pointer" role="menuitem" tabIndex={0} onClick={() => { setIsProfileOpen(false); }}>
                  <UserIcon className="h-5 w-5 text-gray-700 dark:text-gray-200" /> <span>Profile</span>
                </li>
                <li className="py-2 px-4 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center space-x-2 cursor-pointer" role="menuitem" tabIndex={0} onClick={() => { setIsProfileOpen(false); }}>
                  <CogIcon className="h-5 w-5 text-gray-700 dark:text-gray-200" /> <span>Settings</span>
                </li>
                <li className="py-2 px-4 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center space-x-2 cursor-pointer" role="menuitem" tabIndex={0} onClick={() => { handleLogout(); setIsProfileOpen(false); }}>
                  <ArrowRightIcon className="h-5 w-5 text-gray-700 dark:text-gray-200" /> <span>Logout</span>
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
