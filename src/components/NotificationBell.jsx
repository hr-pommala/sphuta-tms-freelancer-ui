import { useState } from "react";
import {
  BellIcon,
  CheckCircleIcon,
  FilterIcon,
  TrashIcon,
  CogIcon as Cog6ToothIcon,
  XIcon as XMarkIcon,
} from "@heroicons/react/outline";

const initialNotifications = [
  {
    id: 1,
    title: "Invoice Paid",
    message: "Your invoice #1234 has been paid.",
    time: "2 min ago",
    read: false,
    icon: <CheckCircleIcon className="h-6 w-6 text-blue-500" />,
  },
  {
    id: 2,
    title: "New Client",
    message: "A new client has registered.",
    time: "10 min ago",
    read: false,
    icon: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
  },
  {
    id: 3,
    title: "Invoice Overdue",
    message: "Invoice #1220 is overdue.",
    time: "1 hour ago",
    read: true,
    icon: <CheckCircleIcon className="h-6 w-6 text-yellow-500" />,
  },
];

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Read", value: "read" },
];

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [soundNotif, setSoundNotif] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
        className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none"
        onClick={() => setOpen((o) => !o)}
        aria-label="Show notifications"
      >
        <BellIcon className="h-7 w-7 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 font-semibold">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-50">
          {/* Header with icons */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50 rounded-t-xl">
            <div className="flex items-center gap-2">
              <BellIcon className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-800 text-lg">
                Notifications
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Filter icon */}
              <button
                className="p-1 hover:bg-gray-200 rounded"
                onClick={() => setShowFilter((v) => !v)}
                aria-label="Filter notifications"
              >
                <FilterIcon className="h-5 w-5 text-gray-500" />
              </button>
              {/* Delete icon */}
              <button
                className="p-1 hover:bg-gray-200 rounded"
                onClick={handleDeleteAll}
                aria-label="Delete all notifications"
              >
                <TrashIcon className="h-5 w-5 text-gray-500" />
              </button>
              {/* Settings icon */}
              <button
                className="p-1 hover:bg-gray-200 rounded"
                onClick={() => setShowSettings(true)}
                aria-label="Notification settings"
              >
                <Cog6ToothIcon className="h-5 w-5 text-gray-500" />
              </button>
              {/* Close icon */}
              <button
                className="p-1 hover:bg-gray-200 rounded"
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
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
              <div className="p-6 text-center text-gray-400">No notifications</div>
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
          {/* Settings Modal */}
          {showSettings && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-lg shadow-xl p-6 w-96 relative">
                <button
                  className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded"
                  onClick={() => setShowSettings(false)}
                  aria-label="Close settings"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
                <h2 className="text-lg font-semibold mb-4">
                  Notification Settings
                </h2>
                <div className="mb-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800">Email Notifications</span>
                    <input
                      id="emailNotif"
                      type="checkbox"
                      checked={emailNotif}
                      onChange={() => setEmailNotif((v) => !v)}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800">Push Notifications</span>
                    <input
                      id="pushNotif"
                      type="checkbox"
                      checked={pushNotif}
                      onChange={() => setPushNotif((v) => !v)}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800">Sound/Vibration</span>
                    <input
                      id="soundNotif"
                      type="checkbox"
                      checked={soundNotif}
                      onChange={() => setSoundNotif((v) => !v)}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                  </div>
                </div>
                <div className="mb-2 font-semibold text-gray-700">
                  Recent Activity
                </div>
                <div className="max-h-32 overflow-y-auto mb-4">
                  {notifications.length === 0 ? (
                    <div className="text-gray-400 text-sm text-center">
                      No recent activity
                    </div>
                  ) : (
                    notifications
                      .slice(0, 5)
                      .map((n) => (
                        <div
                          key={n.id}
                          className="flex items-center gap-2 py-1 border-b last:border-b-0 text-sm"
                        >
                          {n.icon}
                          <span className="flex-1">
                            {n.title} -{" "}
                            <span className="text-gray-500">{n.time}</span>
                          </span>
                        </div>
                      ))
                  )}
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
