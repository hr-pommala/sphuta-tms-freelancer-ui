import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // <-- added
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

  const navigate = useNavigate(); // <-- added

  // refs for outside-click detection
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // close notifications if click is outside its ref
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
      // close profile if click is outside its ref
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

  return (
    <header
      className={`flex items-center justify-between px-4 py-3 bg-blue-600 dark:bg-gray-900 text-white shadow-md fixed top-0 z-40 h-16 transition-all duration-300 w-full`}
    >
      {/* Left: Sidebar Toggle and Logo */}
      <div
        className={`flex items-center space-x-4 ${
          isSidebarOpen ? "ml-64" : "ml-16"
        } transition-all duration-300`}
      >
        <button
          className="text-2xl focus:outline-none"
          onClick={toggleSidebar}
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
            aria-label="Search"
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
          aria-pressed={isDarkMode}
        >
          {isDarkMode ? <FiSun /> : <FiMoon />}
        </button>

        {/* Notifications (click to open) */}
        <div className="relative" ref={notificationsRef}>
          <button
            className="text-xl focus:outline-none"
            title="Notifications"
            onClick={() => {
              // toggle notifications; clicking profile should not be affected
              setIsNotificationsOpen((s) => !s);
              // optionally close profile when opening notifications
              setIsProfileOpen(false);
            }}
            aria-expanded={isNotificationsOpen}
            aria-haspopup="true"
          >
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

        {/* User Profile (click to open) */}
        <div className="relative" ref={profileRef}>
          <button
            className="flex items-center space-x-2 focus:outline-none"
            title="Profile"
            onClick={() => {
              setIsProfileOpen((s) => !s);
              // optionally close notifications when opening profile
              setIsNotificationsOpen(false);
            }}
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
          >
            <FiUser />
          </button>

          {isProfileOpen && (
            <div
              className="absolute right-0 mt-2 bg-white text-black rounded-md shadow-lg w-48 dark:bg-gray-700 dark:text-white z-50"
              role="menu"
            >
              <ul className="p-2">
                <li
                  className="py-2 px-4 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center space-x-2 cursor-pointer"
                  role="menuitem"
                  tabIndex={0}
                  onClick={() => {
                    // handle profile click
                    console.log("Profile clicked");
                    setIsProfileOpen(false);
                  }}
                >
                  <FiUser />
                  <span>Profile</span>
                </li>
                <li
                  className="py-2 px-4 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center space-x-2 cursor-pointer"
                  role="menuitem"
                  tabIndex={0}
                  onClick={() => {
                    // handle settings click
                    console.log("Settings clicked");
                    setIsProfileOpen(false);
                  }}
                >
                  <FiSettings />
                  <span>Settings</span>
                </li>
                <li
                  className="py-2 px-4 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center space-x-2 cursor-pointer"
                  role="menuitem"
                  tabIndex={0}
                  onClick={() => {
                    // handle logout click: navigate to login page
                    console.log("Logout clicked");
                    setIsProfileOpen(false);
                    navigate("/", { replace: true }); // <-- navigates to SignInSignUp ("/")
                  }}
                >
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
