import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaClipboardList, FaUsers, FaUser, FaCog, FaProjectDiagram, FaUserPlus } from 'react-icons/fa';

const VerticalMenu = () => {
    const [hoveredMenu, setHoveredMenu] = useState(null);

    const menu = [
        {
            title: "Dashboard",
            path: "/dashboard",
            icon: <FaHome />,
        },
        {
            title: "Management",
            path: "",
            icon: <FaClipboardList />,
            submenu: [
                { title: "Leave Requests", path: "/management/leave-requests", icon: <FaClipboardList /> },
                { title: "Teams", path: "/management/teams", icon: <FaUsers /> },
                { title: "Team Members", path: "/management/team-members", icon: <FaUser /> },
                { title: "Projects", path: "/management/projects", icon: <FaProjectDiagram /> },
                { title: "Employee Onboarding", path: "/management/employee-onboarding", icon: <FaUserPlus /> },
            ],
        },
        {
            title: "Settings",
            path: "/settings",
            icon: <FaCog />,
        },
    ];

    return (
        <nav className="vertical-menu">
            <ul>
                {menu.map((item, index) => (
                    <li
                        key={index}
                        onMouseEnter={() => setHoveredMenu(index)}
                        onMouseLeave={() => setHoveredMenu(null)}
                        className="menu-item"
                    >
                        {item.submenu ? (
                            <div>
                                <span>{item.icon} {item.title}</span>
                                <ul className={`submenu ${hoveredMenu === index ? 'fade-in' : 'fade-out'}`}>
                                    {item.submenu.map((subItem, subIndex) => (
                                        <li key={subIndex}>
                                            <Link to={subItem.path}>{subItem.icon} {subItem.title}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <Link to={item.path}>{item.icon} {item.title}</Link>
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default VerticalMenu;
