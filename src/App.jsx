// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./fragments/Layout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Messages from "./pages/Messages";
import Overview from "./pages/Overview";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";

import AddUser from "./pages/Users/AddUser";
import ManageUsers from "./pages/Users/ManageUsers";
import EditUser from "./pages/Users/EditUser";

import ListClients from "./pages/clients/ListClients";
import NewClient from "./pages/clients/NewClient";

import SettingsProfileList from "./pages/settings/SettingsProfileList";
import SettingsProfileForm from "./pages/settings/SettingsProfileForm";
import SettingsProfileView from "./pages/settings/SettingsProfileView";

// Settings / Preferences (PascalCase paths)
import PreferencesPage from "./pages/Settings/PreferencesPage";
import PreferencesList from "./pages/Settings/PreferencesList";
import PreferencesForm from "./pages/Settings/PreferencesForm";

import TimesheetList from "./pages/Timesheets/TimesheetList";
import NewTimesheet from "./pages/Timesheets/NewTimesheet"; // you already have
import EditTimesheet from "./pages/Timesheets/EditTimesheet";

// Time Entries (parent + nested)
import TimeEntries from "./pages/TimeEntries/TimeEntries";
import TimeEntriesList from "./pages/TimeEntries/TimeEntriesList";
import NewTimeEntry from "./pages/TimeEntries/NewTimeEntry";

// Projects
import ListProjects from "./pages/Projects/ListProjects";
import NewProject from "./pages/Projects/NewProject";
import EditProject from "./pages/Projects/EditProject";

const App = () => {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="overview" element={<Overview />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="reports" element={<Reports />} />
           <Route path="settings" element={<Settings />} />
           <Route path="messages" element={<Messages />} />

          {/* Clients */}
          <Route path="clients/list" element={<ListClients />} />
          <Route path="clients/new" element={<NewClient />} />
          <Route path="clients" element={<ListClients />} />
          <Route path="clients/new" element={<NewClient />} />
          <Route path="clients/edit/:id" element={<NewClient />} />

           {/* Settings Profile Management */}
           <Route path="settings/profile" element={<SettingsProfileList />} />
           <Route path="settings/profile/new" element={<SettingsProfileForm />} />
           <Route path="settings/profile/:id" element={<SettingsProfileView />} />
           <Route path="settings/profile/:id/edit" element={<SettingsProfileForm />} />

           {/*users */}
           <Route path="users" element={<Navigate to="/users/manage" replace />} />
           <Route path="users/add" element={<AddUser />} />
           <Route path="users/manage" element={<ManageUsers />} />
           <Route path="users/:id/edit" element={<EditUser />} />

            {/* Projects */}
            <Route path="projects" element={<ListProjects />} />
            <Route path="projects/list" element={<Navigate to="/projects" replace />} />
            <Route path="projects/new" element={<NewProject />} />
            <Route path="projects/edit/:id" element={<EditProject />} />

            {/* Timesheets (kept as before) */}
            <Route path="timesheets" element={<TimesheetList />} />
            <Route path="timesheets/new" element={<NewTimesheet />} />
            <Route path="timesheets/:id" element={<EditTimesheet />} />

            {/* Time Entries: parent page with nested routes (list + new) */}
            <Route path="time-entries" element={<TimeEntries />}>
              <Route index element={<TimeEntriesList />} />
              <Route path="new" element={<NewTimeEntry />} />
            </Route>

            {/* Settings hub: PreferencesPage contains an <Outlet /> */}
                      <Route path="settings" element={<PreferencesPage />}>
                        <Route
                          index
                          element={
                            <div className="p-4">
                              Pick an action from Settings (Preferences, General, Security).
                            </div>
                          }
                        />
                        <Route path="preferences" element={<PreferencesList />} />
                        <Route path="preferences/new" element={<PreferencesForm />} />
                        <Route path="preferences/:userId" element={<PreferencesForm />} />
                        <Route path="preferences/:userId/edit" element={<PreferencesForm />} />
                        <Route path="preferences/:userId/patch" element={<PreferencesForm />} />
                      </Route>

        </Route>
      </Routes>
    </Router>
  );
};

export default App;
