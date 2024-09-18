import React from 'react';

const Navigation = ({ currentDate, view, goToPrevious, goToNext }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <button
        onClick={goToPrevious}
        className="text-lg font-semibold px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
      >
        &lt; Previous
      </button>
      <div className="text-lg font-semibold">
        {currentDate.format(view === 'day' ? 'MMMM D, YYYY' : view === 'week' ? 'MMM D, YYYY' : 'MMMM YYYY')}
      </div>
      <button
        onClick={goToNext}
        className="text-lg font-semibold px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
      >
        Next &gt;
      </button>
    </div>
  );
};

export default Navigation;
