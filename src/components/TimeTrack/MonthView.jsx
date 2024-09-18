import React from 'react';
import dayjs from 'dayjs';

const MonthView = ({ currentDate, expenses, onExpenseChange }) => {
  const startOfMonth = currentDate.startOf('month');
  const daysInMonth = currentDate.daysInMonth();
  const startOfWeek = startOfMonth.startOf('week');
  const totalDays = 35;

  return (
    <div className="grid grid-cols-7 gap-4">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
        <div key={index} className="text-center font-semibold p-2 border bg-gray-100">
          {day}
        </div>
      ))}

      {[...Array(totalDays)].map((_, index) => {
        const day = startOfWeek.add(index, 'day');
        const isCurrentMonth = day.isSame(currentDate, 'month');
        const dateKey = day.format('YYYY-MM-DD');

        return (
          <div
            key={index}
            className={`grid grid-cols-1 text-center p-2 border ${!isCurrentMonth ? 'bg-gray-200' : ''}`}
          >
            <div className="font-semibold">{day.format('D')}</div>
            {isCurrentMonth && (
              <input
                type="number"
                value={expenses[dateKey] || ''}
                onChange={(e) => onExpenseChange(dateKey, e.target.value)}
                className="text-center p-2 border rounded w-full"
                placeholder="Add expense"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MonthView;
