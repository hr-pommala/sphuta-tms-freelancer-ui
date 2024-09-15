import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import React from 'react';
import './index.css';
import InvoiceForm from './components/NewInvoice/InvoiceForm';
import NewClient from './components/AddClient/NewClient';
import TimeTracking from './components/TimeTrack/TimeTracking';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {

  return (

      <Router>
            <div className="App p-6 bg-gray-100 min-h-screen">
              <div className="max-w-6xl mx-auto">
                <Routes>
                  {/* Route to display the New Client Form */}
                  <Route path="/new-client" element={<NewClient />} />

                  {/* Route to display the New Form */}
                  <Route path="/new-form" element={<InvoiceForm />} />

                  {/* Route to display the New Form */}
                  <Route path="/time-track" element={<TimeTracking />} />

                  {/* Default route to redirect or show a message */}
                  <Route
                    path="*"
                    element={<h2 className="text-center mt-10">Select a form from the URL</h2>}
                  />
                </Routes>
              </div>
            </div>
          </Router>

  )
}

export default App
