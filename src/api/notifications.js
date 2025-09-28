// src/api/notifications.js
// Mock notification fetcher for project scenarios

// Example notification types: message, task, project, timesheet
// In-memory notifications state for demo (replace with backend in production)
let notifications = [
  {
    id: 1,
    type: 'message',
    title: 'New Message',
    description: 'You have received a new message from your manager.',
    time: '2 min ago',
    read: false,
  },
  {
    id: 2,
    type: 'task',
    title: 'Task Assigned',
    description: 'A new task has been assigned to you: "Prepare project report".',
    time: '10 min ago',
    read: false,
  },
  {
    id: 3,
    type: 'project',
    title: 'Project Deadline',
    description: 'Project "Website Redesign" deadline is tomorrow.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: 4,
    type: 'timesheet',
    title: 'Timesheet Approved',
    description: 'Your timesheet for last week has been approved.',
    time: 'Today',
    read: false,
  },
];

export const fetchNotifications = async () => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  // Return mock notifications
  return notifications;
};

export const getUnreadCount = () => notifications.filter(n => !n.read).length;

export const markNotificationAsRead = async (id) => {
  notifications = notifications.map(n => n.id === id ? { ...n, read: true } : n);
  return notifications.find(n => n.id === id);
};

export const markAllNotificationsAsRead = async () => {
  notifications = notifications.map(n => ({ ...n, read: true }));
  return notifications;
};
