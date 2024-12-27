import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="flex justify-between items-center bg-blue-600 text-white p-4 md:p-6 shadow">
      {/* Company Logo */}
      <div className="text-lg md:text-2xl font-bold">Company Logo</div>

      {/* Horizontal Menu */}
      <nav>
        <ul className="flex space-x-4 text-sm md:text-base">
          <li>
            <Link to="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className="hover:underline">
              About
            </Link>
          </li>
          <li>
            <Link to="/services" className="hover:underline">
              Services
            </Link>
          </li>
          <li>
            <Link to="/contact" className="hover:underline">
              Contact
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
