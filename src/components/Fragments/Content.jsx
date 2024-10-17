import React from 'react';
import InvoiceForm from '../NewInvoice/InvoiceForm';
import TimeTracking from '../TimeTrack/TimeTracking';
import NewClient from '../AddClient/NewClient';

const Content = ({ selectedPage }) => {
  // Conditionally render the content based on the selected page
  const renderContent = () => {
    switch (selectedPage) {
      case 'Home':
        return renderPage('Home Page', 'This is the Home page content.');
      case 'Planner':
        return <NewClient />;
      case 'Overview':
        return renderPage('Overview Page','This is the Overview content.');
      case 'All Sales':
        return renderPage('All Sales Page','This is the All Sales content.');
      case 'Invoices':
        return <InvoiceForm />;
      case 'Estimates':
        return renderPage('Estimates Page','This is the Estimates content.');
      case 'Sales Orders':
          return renderPage('Sales Orders Page','This is the Sales Orders content.');
      case 'Customers':
          return renderPage('Customers Page','This is the Customers page content.');
      case 'Product & Services':
          return renderPage('Product & Services Page','This is the Product & Services content.');
      case 'Expenses':
          return renderPage('Expenses Page','This is the Expenses content.');
      case 'Bills':
          return renderPage('Bills Page','This is the Bills content.');
      case 'Vendor':
          return renderPage('Vendor Page','This is the Vendor content.');
      case 'Contractors':
          return renderPage('Contractors Page','This is the Contractors content.');
      case 'Mileage':
          return renderPage('Mileage Page','This is the Mileage content.');
      case '1099 Filings':
          return renderPage('1099 Filings Page','This is the 1099 Filings page content.');
      case 'Marketing':
          return renderPage('Marketing Page','This is the Marketing content.');
      case 'Employees':
          return renderPage('Employees Page','This is the Employees content.');
      case 'Workers Comp':
          return renderPage('Workers Comp Page','This is the Workers Comp content.');
      case 'Time Entries':
          return <TimeTracking />;
      case 'App':
          return renderPage('App','This is the App content.');
      case 'Team Members':
          return renderPage('Team Members','This is the Team Members page content.');
      case 'Items and services':
          return renderPage('Items and services','This is the Items and services content.');
      case 'Bank Connections':
          return renderPage('Bank Connections','This is the Bank Connections content.');
      case 'Settings':
          return renderPage('Settings','This is the Settings content.');
      default:
        return renderPage('Welcome!','Select an item from the menu to get started.');
    }
  };

  // Helper function to simplify rendering similar structures
    const renderPage = (title, description) => {
      return (
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p>{description}</p>
        </div>
      );
    };

    return <div className="flex-1 p-8">{renderContent()}</div>;
};

export default Content;
