import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Content from './Content';

const Layout = () => {
  // State to track the visibility of the sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // State to track the selected content
  const [selectedPage, setSelectedPage] = useState('Dashboard');

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

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle submenu click to load content
  const handleSubMenuClick = (page) => {
    setSelectedPage(page);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      {sidebarOpen && (
        <Sidebar menuData={menuData} onSubMenuClick={handleSubMenuClick} />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-100">
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} />

       <Content selectedPage={selectedPage} />
      </div>
    </div>
  );
};

export default Layout;
