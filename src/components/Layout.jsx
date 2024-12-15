import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import VerticalMenu from './VerticalMenu';
import Breadcrumb from './Breadcrumb';
import './Layout.css';

const Layout = ({ children }) => {
    const location = useLocation();

    return (
        <div className="layout-container">
            {/* Header */}
            <header className="header">
                <h1>Application Title</h1>
            </header>

            <div className="main-content">
                {/* Vertical Menu */}
                <VerticalMenu />

                {/* Body Section */}
                <div className="content">
                    {/* Breadcrumb */}
                    <Breadcrumb location={location} />
                    {/* Dynamic Content */}
                    <div className="body">
                        {children}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="footer">
                <p>&copy; 2024 Company Name. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Layout;
