import React from 'react';
import InvoiceForm from '../NewInvoice/InvoiceForm';
import TimeTracking from '../TimeTrack/TimeTracking';
import NewClient from '../AddClient/NewClient';

const Content = ({ selectedPage }) => {
  // Conditionally render the content based on the selected page
  const renderContent = () => {
    switch (selectedPage) {
      case 'Home':
        return <div><h2>Home Page</h2><p>This is the Home page content.</p></div>;
      case 'Planner':
        return <NewClient />;
      case 'Overview':
        return <div><h2>Overview Page</h2><p>This is the Overview content.</p></div>;
      case 'All Sales':
        return <div><h2>All Sales Page</h2><p>This is the All Sales content.</p></div>;
      case 'Invoices':
        return <InvoiceForm />;
      case 'Estimates':
        return <div><h2>Estimates Page</h2><p>This is the Estimates content.</p></div>;
      case 'Sales Orders':
          return <div><h2>Sales Orders Page</h2><p>This is the Sales Orders content.</p></div>;
      case 'Customers':
          return <div><h2>Customers Page</h2><p>This is the Customers page content.</p></div>;
      case 'Product & Services':
          return <div><h2>Product & Services Page</h2><p>This is the Product & Services content.</p></div>;
      case 'Expenses':
          return <div><h2>Expenses Page</h2><p>This is the Expenses content.</p></div>;
      case 'Bills':
          return <div><h2>Bills Page</h2><p>This is the Bills content.</p></div>;
      case 'Vendor':
          return <div><h2>Vendor Page</h2><p>This is the Vendor content.</p></div>;
      case 'Contractors':
          return <div><h2>Contractors Page</h2><p>This is the Contractors content.</p></div>;
      case 'Mileage':
          return <div><h2>Mileage Page</h2><p>This is the Mileage content.</p></div>;
      case '1099 Filings':
          return <div><h2>1099 Filings Page</h2><p>This is the 1099 Filings page content.</p></div>;
      case 'Marketing':
          return <div><h2>Marketing Page</h2><p>This is the Marketing content.</p></div>;
      case 'Employees':
          return <div><h2>Employees Page</h2><p>This is the Employees content.</p></div>;
      case 'Workers Comp':
          return <div><h2>Worker's Comp Page</h2><p>This is the Worker's Comp content.</p></div>;
      case 'Time Entries':
          return <TimeTracking />;
      default:
        return <div><h2>Welcome!</h2><p>Select an item from the menu to get started.</p></div>;
    }
  };

  return (
    <div className="p-8">
      {renderContent()}
    </div>
  );
};

export default Content;
