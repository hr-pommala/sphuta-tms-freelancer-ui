import React from "react";

const Dashboard = () => {
  return (
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
  );
};

export default Dashboard;
