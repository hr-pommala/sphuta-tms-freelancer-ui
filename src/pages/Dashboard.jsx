// src/pages/Dashboard.jsx
import React from "react";

const Dashboard = () => {
  // pull saved user info from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="p-6">
      {/* Top bar with username */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {user && (
          <span className="text-gray-800 font-medium">
            {user.fullName || user.email}
          </span>
        )}
      </div>

      {/* Cards grid (unchanged) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 dark:text-white shadow-md rounded-md p-4 hover:shadow-lg transition"
          >
            <h3 className="font-bold text-lg mb-2">Card {i + 1}</h3>
            <p className="text-gray-600">This is a responsive dashboard card.</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
 