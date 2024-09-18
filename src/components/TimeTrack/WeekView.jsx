import React from 'react';
import dayjs from 'dayjs';

const WeekView = ({ currentDate, expenses, onExpenseChange }) => {
  const startOfWeek = currentDate.startOf('week');
  return (
    <div className="grid grid-cols-7 gap-4">
      {[...Array(7)].map((_, index) => {
        const day = startOfWeek.add(index, 'day');
        const dateKey = day.format('YYYY-MM-DD');
        return (
          <div key={index} className="grid grid-cols-1 text-center p-2 border">
            <div className="text-center font-semibold">{day.format('ddd, D')}</div>
            <input
              type="number"
              value={expenses[dateKey] || ''}
              onChange={(e) => onExpenseChange(dateKey, e.target.value)}
              className="text-center p-2 border rounded w-full"
              placeholder="Add expense"
            />
          </div>
        );
      })}
    </div>
  );
};

export default WeekView;
