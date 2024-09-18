import React, { useState } from 'react';
import dayjs from 'dayjs';
import Navigation from './Navigation';
import ViewButtons from './ViewButtons';
import DayView from './DayView';
import WeekView from './WeekView';
import MonthView from './MonthView';
import TotalExpense from './TotalExpense';

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

  const renderExpenseCalendar = () => {
    switch (view) {
      case 'day':
        return <DayView currentDate={currentDate} expenses={expenses} onExpenseChange={handleExpenseChange} />;
      case 'week':
        return <WeekView currentDate={currentDate} expenses={expenses} onExpenseChange={handleExpenseChange} />;
      case 'month':
        return <MonthView currentDate={currentDate} expenses={expenses} onExpenseChange={handleExpenseChange} />;
      default:
        return <DayView currentDate={currentDate} expenses={expenses} onExpenseChange={handleExpenseChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-4">Expense Tracking</h1>

        {/* View Selection: Day, Week, Month */}
        <ViewButtons view={view} setView={setView} />

        {/* Navigation buttons */}
        <Navigation
          currentDate={currentDate}
          view={view}
          goToPrevious={goToPrevious}
          goToNext={goToNext}
        />

        {/* Total Expense */}
        <TotalExpense expenses={expenses} />

        {/* Dynamic Calendar for Expense Input */}
        <div className="bg-white shadow-md rounded-lg p-4">
          {renderExpenseCalendar()}
        </div>
      </div>
    </div>
  );
};

export default TimeTracking;
