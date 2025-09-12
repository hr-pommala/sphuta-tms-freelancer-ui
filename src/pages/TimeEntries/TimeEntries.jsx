import React, { useState, useEffect } from "react";
import TimeEntriesList from "./TimeEntriesList";
import NewTimeEntry from "./NewTimeEntry";

const TimeEntries = () => {
  const [activeTab, setActiveTab] = useState("list");

  useEffect(() => {
    const onCreated = (e) => {
      // Switch to list tab when a new entry is created
      setActiveTab("list");
      // e.detail contains the created entry (if you want to use it)
    };

    window.addEventListener("timeEntryCreated", onCreated);
    return () => window.removeEventListener("timeEntryCreated", onCreated);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Time Entries</h2>

      {/* Tabs */}
      <div className="flex space-x-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "list" ? "bg-gray-800 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("list")}
        >
          Entry List
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "new" ? "bg-gray-800 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("new")}
        >
          New Entry
        </button>
      </div>

      {/* Content */}
      {activeTab === "list" ? <TimeEntriesList /> : <NewTimeEntry />}
    </div>
  );
};

export default TimeEntries;
