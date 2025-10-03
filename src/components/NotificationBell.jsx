import { useState, useEffect } from "react";
import {
  BellIcon,
  CheckCircleIcon,
  FilterIcon,
  TrashIcon,
  CogIcon,
  XIcon,
} from "@heroicons/react/outline";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../api/notifications";

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Read", value: "read" },
];

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [soundNotif, setSoundNotif] = useState(false);
  const userId = JSON.parse(localStorage.getItem("user")).id;

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await fetchNotifications(userId);
        // Map backend response into UI-friendly format
        const mapped = data.map((n) => ({
          id: n.id,
          title: n.title,
          message: n.notification_description,
          time: new Date(n.createdAt || Date.now()).toLocaleString(),
          read: n.is_read,
          icon: <CheckCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
        }));
        setNotifications(mapped);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };
    loadNotifications();
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Error marking notification as read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Error marking all as read", err);
    }
  };

  const handleDeleteAll = () => {
    setNotifications([]);
  };

  const handleFilter = (value) => {
    setFilter(value);
    setShowFilter(false);
  };

  const handleClearHistory = () => setNotifications([]);

  const filteredNotifications =
    filter === "all"
      ? notifications
      : filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications.filter((n) => n.read);

  return (
    <div className="relative inline-block text-left">
      <button
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
        onClick={() => setOpen((o) => !o)}
        aria-label="Show notifications"
      >
        <BellIcon className="h-7 w-7 text-gray-700 dark:text-gray-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-600 dark:bg-blue-400 text-white text-xs rounded-full px-1.5 py-0.5 font-semibold">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-50">
          {/* Header with icons */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50 rounded-t-xl">
            <div className="flex items-center gap-2">
              <BellIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-gray-800 text-lg">
                Notifications
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="p-1 hover:bg-gray-200 rounded"
                onClick={() => setShowFilter((v) => !v)}
                aria-label="Filter notifications"
              >
                <FilterIcon className="h-5 w-5 text-gray-500 dark:text-gray-300" />
              </button>
              <button
                className="p-1 hover:bg-gray-200 rounded"
                onClick={handleDeleteAll}
                aria-label="Delete all notifications"
              >
                <TrashIcon className="h-5 w-5 text-gray-500 dark:text-gray-300" />
              </button>
              <button
                className="p-1 hover:bg-gray-200 rounded"
                onClick={() => setShowSettings(true)}
                aria-label="Notification settings"
              >
                <CogIcon className="h-5 w-5 text-gray-500 dark:text-gray-300" />
              </button>
              <button
                className="p-1 hover:bg-gray-200 rounded"
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
              >
                <XIcon className="h-5 w-5 text-gray-500 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* Filter dropdown */}
          {showFilter && (
            <div className="absolute right-16 top-12 bg-white border border-gray-200 rounded shadow-md z-50 w-32">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={`w-full text-left px-4 py-2 hover:bg-blue-50 ${
                    filter === opt.value
                      ? "font-semibold text-blue-600"
                      : "text-gray-700"
                  }`}
                  onClick={() => handleFilter(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Mark all as read */}
          <div className="px-4 py-2 border-b border-gray-100 bg-white flex justify-end">
            <button
              className="text-xs text-blue-600 hover:underline font-medium"
              onClick={handleMarkAllAsRead}
              disabled={notifications.length === 0 || unreadCount === 0}
            >
              Mark all as read
            </button>
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                No notifications
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <button
                  key={n.id}
                  className={`w-full text-left flex items-start gap-3 px-5 py-4 border-b last:border-b-0 border-gray-100 transition focus:outline-none ${
                    n.read ? "bg-gray-50" : "bg-white hover:bg-blue-50"
                  }`}
                  onClick={() => handleMarkAsRead(n.id)}
                >
                  <div>{n.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      {n.title}
                      {!n.read && (
                        <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <div className="text-gray-600 text-sm">{n.message}</div>
                    <div className="text-xs text-gray-400 mt-1">{n.time}</div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Settings Modal (unchanged) */}
          {showSettings && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-lg shadow-xl p-6 w-96 relative">
                <button
                  className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded"
                  onClick={() => setShowSettings(false)}
                  aria-label="Close settings"
                >
                  <XIcon className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                </button>
                <h2 className="text-lg font-semibold mb-4">
                  Notification Settings
                </h2>
                {/* Settings checkboxes */}
                <div className="mb-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800">Email Notifications</span>
                    <input
                      type="checkbox"
                      checked={emailNotif}
                      onChange={() => setEmailNotif((v) => !v)}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800">Push Notifications</span>
                    <input
                      type="checkbox"
                      checked={pushNotif}
                      onChange={() => setPushNotif((v) => !v)}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800">Sound/Vibration</span>
                    <input
                      type="checkbox"
                      checked={soundNotif}
                      onChange={() => setSoundNotif((v) => !v)}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                  </div>
                </div>
                <button
                  className="w-full py-2 mt-2 bg-red-50 hover:bg-red-100 text-red-600 rounded font-medium"
                  onClick={handleClearHistory}
                  disabled={notifications.length === 0}
                >
                  Clear Notification History
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
