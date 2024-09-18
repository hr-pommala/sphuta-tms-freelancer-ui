import React from 'react';

const DayView = ({ currentDate, expenses, onExpenseChange }) => {
  const dateKey = currentDate.format('YYYY-MM-DD');
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="text-center">{currentDate.format('dddd, MMMM D, YYYY')}</div>
      <input
        type="number"
        value={expenses[dateKey] || ''}
        onChange={(e) => onExpenseChange(dateKey, e.target.value)}
        className="text-center p-2 border rounded w-full"
        placeholder="Add expense"
      />
    </div>
  );
};

export default DayView;
