import { FiGrid, FiUser, FiSettings, FiMail } from "react-icons/fi";

export const menuData = [
  {
    name: "Dashboard",
    icon: <FiGrid />,
    component: "/",
    submenus: [
      { name: "Overview", component: "/overview" },
      { name: "Analytics", component: "/analytics" },
      { name: "Reports", component: "/reports" },
    ],
  },
  {
    name: "Users",
    icon: <FiUser />,
    component: "/users",
    submenus: [
      { name: "Add User", component: "/users/add" },
      { name: "Manage Users", component: "/users/manage" },
    ],
  },
  {
    name: "Settings",
    icon: <FiSettings />,
    component: "/settings",
    submenus: [
      { name: "General", component: "/general-settings" },
      { name: "Security", component: "/security-settings" },
    ],
  },
  {
    name: "Messages",
    icon: <FiMail />,
    component: "/messages",
    submenus: [
      { name: "Inbox", component: "/inbox" },
      { name: "Sent", component: "/sent-messages" },
    ],
  },
];
