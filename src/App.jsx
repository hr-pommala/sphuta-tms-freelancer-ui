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
import NewTimesheet from "./pages/Timesheets/NewTimesheet";
import EditTimesheet from "./pages/Timesheets/EditTimesheet";

// Time Entries (parent + nested)
import TimeEntries from "./pages/TimeEntries/TimeEntries";
import TimeEntriesList from "./pages/TimeEntries/TimeEntriesList";
import NewTimeEntry from "./pages/TimeEntries/NewTimeEntry";

// Projects
import ListProjects from "./pages/Projects/ListProjects";
import NewProject from "./pages/Projects/NewProject";
import EditProject from "./pages/Projects/EditProject";

// invoicing pages
import SettingsInvoicingList from "./pages/settings/SettingsInvoicingList";
import SettingsInvoicingForm from "./pages/settings/SettingsInvoicingForm";
import SettingsInvoicingView from "./pages/settings/SettingsInvoicingView";

import SignInSignUp from "./pages/SignInSignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes (no Layout) */}
        <Route path="/" element={<SignInSignUp />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset" element={<ResetPassword />} />

        {/* Protected area inside Layout */}
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="overview" element={<Overview />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="messages" element={<Messages />} />

          {/* Settings Invoicing routes */}
          <Route path="settings/invoicing" element={<SettingsInvoicingList />} />
          <Route path="settings/invoicing/new" element={<SettingsInvoicingForm />} />
          <Route path="settings/invoicing/view/:userId" element={<SettingsInvoicingView />} />
          <Route path="settings/invoicing/edit/:userId" element={<SettingsInvoicingForm />} />

          {/* Settings Profile Management */}
          <Route path="settings/profile" element={<SettingsProfileList />} />
          <Route path="settings/profile/new" element={<SettingsProfileForm />} />
          <Route path="settings/profile/:id" element={<SettingsProfileView />} />
          <Route path="settings/profile/:id/edit" element={<SettingsProfileForm />} />

          {/* Users */}
          <Route path="users" element={<Navigate to="/users/manage" replace />} />
          <Route path="users/add" element={<AddUser />} />
          <Route path="users/manage" element={<ManageUsers />} />
          <Route path="users/:id/edit" element={<EditUser />} />

          {/* Clients */}
          <Route path="clients/list" element={<ListClients />} />
          <Route path="clients/new" element={<NewClient />} />
          <Route path="clients" element={<ListClients />} />
          <Route path="clients/edit/:id" element={<NewClient />} />


          {/* Projects */}
          <Route path="projects" element={<ListProjects />} />
          <Route path="projects/list" element={<Navigate to="/projects" replace />} />
          <Route path="projects/new" element={<NewProject />} />
          <Route path="projects/edit/:id" element={<EditProject />} />

          {/* Timesheets */}
          <Route path="timesheets" element={<TimesheetList />} />
          <Route path="timesheets/new" element={<NewTimesheet />} />
          <Route path="timesheets/:id" element={<EditTimesheet />} />

          {/* Time Entries */}
          <Route path="time-entries" element={<TimeEntries />}>
            <Route index element={<TimeEntriesList />} />
            <Route path="new" element={<NewTimeEntry />} />
          </Route>

          {/* Settings hub with Preferences */}
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

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
