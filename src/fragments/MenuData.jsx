import { FiGrid, FiUser, FiSettings, FiMail ,FiFolder} from "react-icons/fi";
import { FaUsers } from "react-icons/fa"; // Added icon for Clients
import { FaRegClock } from "react-icons/fa";
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
    name: "Clients",
    icon: <FaUsers />, // Clients icon
    component: "/clients",
    submenus: [
      { name: "List Clients", component: "/clients/list" },
      { name: "New Client", component: "/clients/new" },
    ],
  },
  {
     name: "Projects",
     icon: <FiFolder />,
     component: "/projects",
     submenus: [
       { name: "List Projects", component: "/projects/list" },
       { name: "New Project", component: "/projects/new" },
     ],
   },
  {
    name: "Users",
    icon: <FiUser />,
    component: "/users",
    submenus: [
      { name: "Add User", component: "/users/add" },
      { name: "Manage Users", component: "/users/manage" }
    ],
  },
  {
    name: "Timesheets",
    icon: <FaRegClock />,
    component: "/timesheets",
    submenus: [
      { name: "List Timesheets", component: "/timesheets" },
      { name: "New Timesheet", component: "/timesheets/new" },
      // Edit is dynamic, accessed from list page
    ],
  },
  {
    name: "Time Entries",
    icon: <FaRegClock />,
    component: "/time-entries",
    submenus: [
      { name: "TimeEntry", component: "/time-entries" }
    ],
  },
 {
     name: "Settings",
     icon: <FiSettings />,
     component: "/settings",
     submenus: [
       { name: "General", component: "/general-settings" },
       { name: "Security", component: "/security-settings" },
       { name: "Profile Settings", component: "/settings/profile" },
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
