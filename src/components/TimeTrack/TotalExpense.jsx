import React from 'react';

const TotalExpense = ({ expenses }) => {
  const total = Object.values(expenses).reduce((acc, expense) => acc + expense, 0);

  return (
    <div className="text-right text-lg font-semibold mb-4">
      Total Expense: ${total.toFixed(2)}
    </div>
  );
};

export default TotalExpense;
