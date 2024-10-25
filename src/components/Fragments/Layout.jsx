import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Content from './Content';
import Breadcrumbs from './Breadcrumbs';

const Layout = ({ userName }) => {
  // State to track the visibility of the sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // State to track the selected content
  const [selectedPage, setSelectedPage] = useState('Dashboard');

  const [breadcrumbPath, setBreadcrumbPath] = useState([]); // Track breadcrumb path

  // JSON menu data
  const menuData = {
    "Dashboards": ["Home", "Planner"],
    "Sales": ["Overview", "All Sales", "Invoices","Estimates","Sales Orders","Customers","Product & Services"],
    "Expenses": ["Expenses", "Bills", "Vendor","Contractors","Mileage","1099 Filings"],
    "Customers & Leads": ["Overview", "Customers", "Marketing"],
    "Payroll": ["Employees", "Contractors", "Vendor","Worker's Comp"],
    "Time": ["Overview", "Time Entries"],
    "Budget": []
  };

  //JSON section 3 menu data
  const dynamicMenus = ['App', 'Team Members', 'Items and services', 'Bank Connections', 'Settings'];

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle submenu click to load content
  const handleSubMenuClick = (menuName, parentName) => {
    setSelectedPage(menuName);

    // Update breadcrumb path based on menu selection
    const newPath = parentName ? [parentName, menuName] : [menuName];
    setBreadcrumbPath(newPath);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      {sidebarOpen && (
        <Sidebar
            menuData={menuData}
            dynamicMenus={dynamicMenus}
            onSubMenuClick={(menu, parent) => handleSubMenuClick(menu, parent)}
            userName={userName}
            logoUrl="./src/assets/sphuta.png"
          />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-100">
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} />
        <Breadcrumbs path={breadcrumbPath} /> {/* Display breadcrumbs */}
        <Content selectedPage={selectedPage} />
      </div>
    </div>
  );
};

export default Layout;
