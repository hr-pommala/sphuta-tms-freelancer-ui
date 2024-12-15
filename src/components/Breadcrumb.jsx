import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ location }) => {
    const generateBreadcrumb = () => {
        const pathParts = location.pathname.split("/").filter(Boolean);
        let breadcrumbPath = "";

        return pathParts.map((part, index) => {
            breadcrumbPath += `/${part}`;
            const title = part.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
            return (
                <span key={index}>
                    <Link to={breadcrumbPath}>{title}</Link>
                    {index < pathParts.length - 1 && " / "}
                </span>
            );
        });
    };

    return <div className="breadcrumb">Breadcrumb: {generateBreadcrumb()}</div>;
};

export default Breadcrumb;
