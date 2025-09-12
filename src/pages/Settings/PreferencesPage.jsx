// src/pages/Settings/PreferencesPage.jsx
import React from "react";
import { Outlet, NavLink } from "react-router-dom";

const PreferencesPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <nav className="flex gap-3 mb-6">
        <NavLink
          to="/settings/preferences"
          end
          className={({ isActive }) =>
            `px-4 py-2 rounded ${isActive ? "bg-slate-700 text-white" : "bg-slate-100"}`
          }
        >
          Preference List
        </NavLink>

        <NavLink
          to="/settings/preferences/new"
          className={({ isActive }) =>
            `px-4 py-2 rounded ${isActive ? "bg-slate-700 text-white" : "bg-slate-100"}`
          }
        >
          New Preference
        </NavLink>
      </nav>

      <div className="bg-white shadow rounded p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default PreferencesPage;
