import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Projects from './components/Projects';
import EmployeeOnboarding from './components/EmployeeOnboarding';

function App() {

    const [userName, setUserName] = useState(null); // Track the logged-in user

    // Handle login and save the user ID
    const handleLogin = (userId) => {
        setUserName(userId); // Set the logged-in user
    };


  return (

      <Router>
          <Layout>
              <Routes>
                  <Route path="/dashboard" element={<h2>Dashboard</h2>} />
                  <Route path="/management/projects" element={<Projects />} />
                  <Route path="/management/employee-onboarding" element={<EmployeeOnboarding />} />
                  <Route path="/settings" element={<h2>Settings</h2>} />
              </Routes>
          </Layout>
      </Router>

  )
}

export default App
