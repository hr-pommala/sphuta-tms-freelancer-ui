import React from 'react';

const ViewButtons = ({ view, setView }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <button
          onClick={() => setView('day')}
          className={`px-4 py-2 rounded-md mr-2 ${view === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Day
        </button>
        <button
          onClick={() => setView('week')}
          className={`px-4 py-2 rounded-md mr-2 ${view === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Week
        </button>
        <button
          onClick={() => setView('month')}
          className={`px-4 py-2 rounded-md ${view === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Month
        </button>
      </div>
    </div>
  );
};

export default ViewButtons;
