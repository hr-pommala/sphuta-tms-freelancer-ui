import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const routeTitleMap = [
  { match: /^\/dashboard/, title: "Dashboard" },
  { match: /^\/overview/, title: "Overview" },
  { match: /^\/analytics/, title: "Analytics" },
  { match: /^\/reports/, title: "Reports" },
  { match: /^\/settings(\/|$)/, title: "Settings" },
  { match: /^\/messages/, title: "Messages" },
  { match: /^\/users/, title: "Users" },
  { match: /^\/clients/, title: "Clients" },
  { match: /^\/projects/, title: "Projects" },
  { match: /^\/timesheets/, title: "Timesheets" },
  { match: /^\/time-entries/, title: "Time Entries" },
  { match: /^\/tasks/, title: "Tasks" },
  { match: /^\/forgot/, title: "Forgot Password" },
  { match: /^\/reset/, title: "Reset Password" },
  { match: /^\/$/, title: "Sign In / Sign Up" },
];

const DynamicTitle = () => {
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname;
    const found = routeTitleMap.find((r) => r.match.test(path));
    const pageTitle = found ? found.title : "Sphuta TMS";
    document.title = `${pageTitle} | Sphuta TMS`;
  }, [location]);
  return null;
};

export default DynamicTitle;

