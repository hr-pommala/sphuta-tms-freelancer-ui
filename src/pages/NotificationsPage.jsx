import React, { useEffect, useState } from "react";
import { fetchNotifications, markNotificationAsRead } from "../api/notifications";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchNotifications();
        setNotifications(data);
      } catch (err) {
        setError("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleNotificationClick = async (id) => {
    await markNotificationAsRead(id);
    const data = await fetchNotifications();
    setNotifications(data);
  };

  return (
    <div className="max-w-2xl mx-auto mt-24 p-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-700 dark:text-blue-300">All Notifications</h1>
      {loading && <div className="py-12 text-center text-lg">Loading...</div>}
      {error && <div className="text-red-500 py-12 text-center">{error}</div>}
      {!loading && !error && notifications.length === 0 && <div className="py-12 text-center text-gray-400">No notifications.</div>}
      {!loading && !error && notifications.length > 0 && (
        <ul className="space-y-4">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`flex items-start gap-4 p-5 rounded-xl shadow-md border transition-colors cursor-pointer group ${n.read ? 'bg-gray-50 dark:bg-gray-900 text-gray-400 border-gray-100 dark:border-gray-800' : 'bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-700'} hover:bg-blue-100 dark:hover:bg-blue-800`}
              onClick={() => handleNotificationClick(n.id)}
            >
              <div className="mt-1">
                {n.read ? (
                  <span className="inline-block w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                ) : (
                  <span className="inline-block w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse"></span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-lg leading-tight">{n.title}</span>
                  <span className={`text-xs ml-2 px-2 py-0.5 rounded-full font-medium ${n.read ? 'bg-gray-200 dark:bg-gray-700 text-gray-500' : 'bg-blue-100 text-blue-700 dark:bg-blue-200 dark:text-blue-900'}`}>{n.read ? 'Read' : 'Unread'}</span>
                </div>
                <div className="text-base leading-snug">{n.description}</div>
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-2 block">{n.time}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsPage;
