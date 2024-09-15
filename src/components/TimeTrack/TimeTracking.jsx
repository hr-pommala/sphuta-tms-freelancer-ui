import React, { useState } from 'react';
import { CurrencyDollarIcon, DocumentIcon, ClockIcon } from '@heroicons/react/24/solid';
import dayjs from 'dayjs';

const TimeTracking = () => {
  const [view, setView] = useState('day'); // Default view is 'day'
  const [currentDate, setCurrentDate] = useState(dayjs()); // Track the current date
  const [expenses, setExpenses] = useState({}); // Track expenses for each day/week/month

  // Helper to handle expense input changes
  const handleExpenseChange = (key, value) => {
    setExpenses((prevExpenses) => ({
      ...prevExpenses,
      [key]: parseFloat(value) || 0, // Ensure value is treated as a number
    }));
  };

  // Helper to calculate total expenses for current view
  const calculateTotal = () => {
    return Object.values(expenses).reduce((acc, expense) => acc + expense, 0);
  };

  // Navigation Functions
  const goToPrevious = () => {
    switch (view) {
      case 'day':
        setCurrentDate(currentDate.subtract(1, 'day'));
        break;
      case 'week':
        setCurrentDate(currentDate.subtract(1, 'week'));
        break;
      case 'month':
        setCurrentDate(currentDate.subtract(1, 'month'));
        break;
      default:
        break;
    }
  };

  const goToNext = () => {
    switch (view) {
      case 'day':
        setCurrentDate(currentDate.add(1, 'day'));
        break;
      case 'week':
        setCurrentDate(currentDate.add(1, 'week'));
        break;
      case 'month':
        setCurrentDate(currentDate.add(1, 'month'));
        break;
      default:
        break;
    }
  };

  // Render day view for expense input
  const renderDayView = () => {
    const dateKey = currentDate.format('YYYY-MM-DD');
    return (
      <div className="grid grid-cols-1 gap-4">
        <div className="text-center">{currentDate.format('dddd, MMMM D, YYYY')}</div>
        <input
          type="number"
          value={expenses[dateKey] || ''}
          onChange={(e) => handleExpenseChange(dateKey, e.target.value)}
          className="text-center p-2 border rounded w-full"
          placeholder="Add expense"
        />
      </div>
    );
  };

  // Render week view for expense input in grid format
  const renderWeekView = () => {
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
                onChange={(e) => handleExpenseChange(dateKey, e.target.value)}
                className="text-center p-2 border rounded w-full"
                placeholder="Add expense"
              />
            </div>
          );
        })}
      </div>
    );
  };

  // Render month view for expense input in grid format
  const renderMonthView = () => {
    const startOfMonth = currentDate.startOf('month');
    const daysInMonth = currentDate.daysInMonth();
    const startOfWeek = startOfMonth.startOf('week'); // To start from Sunday/Monday in the calendar
    const totalDays = 35; // Always show 5 weeks (5*7 = 35 days) for consistent layout

    return (
      <div className="grid grid-cols-7 gap-4">
        {/* Generate Days of the Week Header */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div key={index} className="text-center font-semibold p-2 border bg-gray-100">
            {day}
          </div>
        ))}

        {/* Generate the days of the month */}
        {[...Array(totalDays)].map((_, index) => {
          const day = startOfWeek.add(index, 'day');
          const isCurrentMonth = day.isSame(currentDate, 'month');
          const dateKey = day.format('YYYY-MM-DD');

          return (
            <div
              key={index}
              className={`grid grid-cols-1 text-center p-2 border ${
                isCurrentMonth ? 'bg-white' : 'bg-gray-200'
              }`}
            >
              <div className={`text-center ${isCurrentMonth ? 'font-semibold' : 'text-gray-400'}`}>
                {day.format('D')}
              </div>
              {isCurrentMonth && (
                <input
                  type="number"
                  value={expenses[dateKey] || ''}
                  onChange={(e) => handleExpenseChange(dateKey, e.target.value)}
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

  // Render the calendar based on the selected view
  const renderExpenseCalendar = () => {
    switch (view) {
      case 'day':
        return renderDayView();
      case 'week':
        return renderWeekView();
      case 'month':
        return renderMonthView();
      default:
        return renderDayView();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-6">

          {/* Main Grid with Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-100 p-4 rounded-lg shadow-md text-center">
              <CurrencyDollarIcon className="h-12 w-12 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold">Get Paid for All Your Time</h3>
              <p className="text-sm text-gray-600">You can track time with the timer or by logging time manually.</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg shadow-md text-center">
              <DocumentIcon className="h-12 w-12 text-yellow-600 mx-auto mb-2" />
              <h3 className="font-semibold">Convert Time into Invoices</h3>
              <p className="text-sm text-gray-600">Accurately bill your clients for the time you've worked.</p>
            </div>
            <div className="bg-pink-100 p-4 rounded-lg shadow-md text-center">
              <ClockIcon className="h-12 w-12 text-pink-600 mx-auto mb-2" />
              <h3 className="font-semibold">Track Everything for Everyone</h3>
              <p className="text-sm text-gray-600">Don’t miss a billable moment by staying on top of hours.</p>
            </div>
          </div>

          {/* Payroll Section */}
          <div className="bg-yellow-200 p-4 rounded-lg shadow-md mb-6">
            <h3 className="font-semibold">Run Payroll Effortlessly</h3>
            <p className="text-sm text-gray-600">Track time and pay your employees directly from your account.</p>
          </div>

        <h1 className="text-2xl font-semibold mb-4">Expense Tracking</h1>

        {/* View Selection: Day, Week, Month */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <button
              onClick={() => setView('day')}
              className={`px-4 py-2 rounded-md mr-2 ${
                view === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 rounded-md mr-2 ${
                view === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 rounded-md ${
                view === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Month
            </button>
          </div>
          <div className="font-semibold text-xl">
            Total Expenses: {calculateTotal().toFixed(2)}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={goToPrevious}
            className="text-lg font-semibold px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            &lt; Previous
          </button>
          <div className="text-lg font-semibold">{currentDate.format(view === 'day' ? 'MMMM D, YYYY' : view === 'week' ? 'MMM D, YYYY' : 'MMMM YYYY')}</div>
          <button
            onClick={goToNext}
            className="text-lg font-semibold px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Next &gt;
          </button>
        </div>

        {/* Dynamic Calendar for Expense Input */}
        <div className="bg-white shadow-md rounded-lg p-4">
          {renderExpenseCalendar()}
        </div>
      </div>
    </div>
  );
};

export default TimeTracking;
