import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Consulting from "./pages/Consulting";
import Strategy from "./pages/Strategy";
import Operations from "./pages/Operations";
import Development from "./pages/Development";
import Support from "./pages/Support";
import Features from "./pages/Features";
import Contact from "./pages/Contact";

const App = () => {
  return (
    <Router>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <div className="flex-grow overflow-auto p-4 bg-gray-100">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/consulting" element={<Consulting />} />
            <Route path="/strategy" element={<Strategy />} />
            <Route path="/operations" element={<Operations />} />
            <Route path="/development" element={<Development />} />
            <Route path="/support" element={<Support />} />
            <Route path="/features" element={<Features />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
};

export default App;
