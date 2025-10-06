import api from "./axios";

/**
 * Fetch unread notifications for a user.
 * Backend endpoint: GET /users/{userId}/notifications
 */
export const fetchNotifications = async (userId) => {
  const res = await api.get(`/users/${userId}/notifications`, {
    headers: {
      Authorization: localStorage.getItem("token"), // token already contains "Bearer ..."
    },
  });
  return res.data.items; // backend response has { count, items }
};

/** Get unread count */
export const fetchUnreadCount = async (userId) => {
  const res = await api.get(`/users/${userId}/notifications`, {
    headers: {
      Authorization: localStorage.getItem("token"),
    },
  });
  return res.data.count.unread;
};

/** Mark a single notification as read */
export const markNotificationAsRead = async (notificationId) => {
  await api.post(`/notifications/${notificationId}/read`, {}, {
    headers: {
      Authorization: localStorage.getItem("token"),
    },
  });
};

/** Mark all notifications as read */
export const markAllNotificationsAsRead = async () => {
  await api.post(`/notifications/read-all`, {}, {
    headers: {
      Authorization: localStorage.getItem("token"),
    },
  });
};
