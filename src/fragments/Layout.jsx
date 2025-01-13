import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div
      className={`h-screen flex ${isDarkMode ? "dark" : ""}`} // Apply dark mode class
    >
      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} />

      <div className="flex flex-col flex-grow">
        {/* Header */}
        <Header
          toggleSidebar={toggleSidebar}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />

        {/* Main Content */}
        <main
          className={`flex-grow p-4 bg-gray-100 dark:bg-gray-800 dark:text-white transition-all duration-300 ${
            isSidebarOpen ? "ml-64" : "ml-16"
          } pt-16`}
        >
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
