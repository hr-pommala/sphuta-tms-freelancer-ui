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
import { fetchNotifications, getUnreadCount, markNotificationAsRead, markAllNotificationsAsRead } from "../api/notifications";

const Header = ({ toggleSidebar, isSidebarOpen, isDarkMode, setIsDarkMode }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

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

  // Fetch notifications when opening the dropdown
  const handleNotificationsClick = async () => {
    setIsNotificationsOpen((open) => !open);
    setIsProfileOpen(false);
    if (!isNotificationsOpen && notifications.length === 0 && !notificationsLoading) {
      setNotificationsLoading(true);
      setNotificationsError(null);
      try {
        const data = await fetchNotifications();
        setNotifications(data);
        setUnreadCount(getUnreadCount());
      } catch (err) {
        setNotificationsError("Failed to load notifications.");
      } finally {
        setNotificationsLoading(false);
      }
    }
  };

  // Mark a single notification as read
  const handleNotificationClick = async (id) => {
    await markNotificationAsRead(id);
    const data = await fetchNotifications();
    setNotifications(data);
    setUnreadCount(getUnreadCount());
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
    const data = await fetchNotifications();
    setNotifications(data);
    setUnreadCount(0);
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
          <button className="text-xl focus:outline-none" title="Notifications" onClick={handleNotificationsClick} aria-expanded={isNotificationsOpen} aria-haspopup="true">
            <FiBell />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full px-1.5 py-0.5 text-white">{unreadCount}</span>
            )}
          </button>
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 bg-white text-black rounded-xl shadow-2xl w-80 dark:bg-gray-800 dark:text-white z-50 border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-bold text-lg">Notifications</h3>
                <button className="text-xs text-blue-500 hover:underline" onClick={handleMarkAllAsRead}>Mark all as read</button>
              </div>
              <div className="p-2 max-h-96 overflow-y-auto" style={{ maxHeight: '400px' }}>
                {notificationsLoading && <div className="py-6 text-center">Loading...</div>}
                {notificationsError && <div className="text-red-500 py-6 text-center">{notificationsError}</div>}
                {!notificationsLoading && !notificationsError && notifications.length === 0 && <div className="py-6 text-center">No notifications.</div>}
                {!notificationsLoading && !notificationsError && notifications.length > 0 && (
                  <ul className="space-y-1">
                    {notifications.map((n) => (
                      <li
                        key={n.id}
                        className={`flex items-start gap-3 border-b last:border-b-0 pb-2 last:pb-0 border-gray-100 dark:border-gray-700 cursor-pointer rounded-lg transition-colors px-2 py-2 group ${n.read ? 'bg-gray-50 dark:bg-gray-900 text-gray-400' : 'bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-200 border-l-4 border-blue-500 dark:border-blue-400 shadow-sm'} hover:bg-blue-100 dark:hover:bg-blue-800`}
                        onClick={() => handleNotificationClick(n.id)}
                        style={{ minHeight: '56px' }}
                      >
                        <div className="mt-1">
                          {n.read ? (
                            <span className="inline-block w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                          ) : (
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse"></span>
                          )}
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-base leading-tight">{n.title}</span>
                          <div className="text-sm leading-snug">{n.description}</div>
                          <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 block">{n.time}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {/* Removed View All button and footer */}
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
