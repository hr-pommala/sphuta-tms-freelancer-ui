import { useState } from 'react'
import './App.css'
import React from 'react';
import './index.css';
import InvoiceForm from './components/NewInvoice/InvoiceForm';
import NewClient from './components/AddClient/NewClient';
import TimeTracking from './components/TimeTrack/TimeTracking';
import LeftSideMenu from './components/Navigation/LeftSideMenu';
import Layout from './components/Fragments/Layout';
import LoginPage from './components/Login/LoginPage';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

//import Invoice from './components/Invoice';

function App() {

    const [userName, setUserName] = useState(null); // Track the logged-in user

    // Handle login and save the user ID
    const handleLogin = (userId) => {
        setUserName(userId); // Set the logged-in user
    };


  return (

      <Router>
            <Routes>
             {/*   */}{/* Route to display the New Client Form */}{/*
              <Route path="/new-client" element={<NewClient />} />

               */}{/* Route to display the New Form */}{/*
              <Route path="/new-form" element={<InvoiceForm />} />

               */}{/* Route to display the Time Tracking */}{/*
              <Route path="/time-track" element={<TimeTracking />} />

                */}{/* Route to display the Left side menu */}{/*
              <Route path="/leftSide-menu" element={<LeftSideMenu />} />

               */}{/* Route to display the Layout */}{/*
              <Route path="/layout-form" element={<Layout />} /> */}

              {/* Login Page */}
              <Route path="/" element={userName ? <Navigate to="/layout-form" /> : <LoginPage onLogin={handleLogin} />} />

              {/* Main Page after Login */}
              <Route
                 path="/layout-form"
                 element={userName ? <Layout userName={userName} /> : <Navigate to="/" />}
              />

              {/* Default route to redirect or show a message */}
              {/* <Route
                path="*"
                element={<h2 className="text-center mt-10">Select a form from the URL</h2>}
              /> */}
            </Routes>
          </Router>

  )
}

export default App
