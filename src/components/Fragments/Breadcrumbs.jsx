import React from 'react';
import { FaChevronRight } from 'react-icons/fa';

const Breadcrumbs = ({ path }) => {
  return (
    <nav className="text-gray-600 text-sm mb-4">
      {path.map((crumb, index) => (
        <span key={index} className="inline-flex items-center">
          <span>{crumb}</span>
          {index < path.length - 1 && <FaChevronRight className="mx-2" />}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
