import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import DynamicTitle from "../components/DynamicTitle";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className={`flex h-screen ${isDarkMode ? "dark" : ""}`}>
      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Layout */}
      <div className="flex flex-col flex-grow">
        <DynamicTitle />
        {/* Header */}
        <Header
          toggleSidebar={toggleSidebar}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Content */}
        <main
          className={`flex-grow bg-gray-100 dark:bg-gray-800 p-4 transition-all duration-300 ${
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
