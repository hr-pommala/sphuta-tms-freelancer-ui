import React, { useState } from 'react';

const HorizontalMenu = () => {
  const [selectedItem, setSelectedItem] = useState(null);

  // List of specific items to display in the menu
  const menuItems = ["Overview", "All Sales", "Invoices", "Estimates", "Sales Orders", "Customers", "Product & Services"];

  return (
    <div className="p-4">
      {/* Menu Section */}
      <div className="flex flex-wrap gap-4 mb-4">
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedItem(item)}
            className={`px-4 py-2 border rounded ${
              selectedItem === item ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Content Section */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {selectedItem === "Overview" ? (
          // Show all items in separate divs if "Overview" is selected
          menuItems.map((item, idx) => (
            <div key={idx} className="relative p-4 border rounded bg-gray-50">
              <h3 className="text-lg font-bold">{item}</h3>
              <p>Content for {item}</p>

              {/* Custom Right-Aligned Content for Specific Items */}
              {item === "All Sales" && (
                <span className="absolute top-2 right-2 text-sm text-gray-600">Sales</span>
              )}
              {item === "Invoices" && (
                <select className="absolute top-2 right-2 border p-1 rounded">
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              )}
              {item === "Estimates" && (
                <div className="absolute top-2 right-2 space-x-2">
                  <button className="px-2 py-1 bg-green-500 text-white rounded">Accept</button>
                  <button className="px-2 py-1 bg-red-500 text-white rounded">Reject</button>
                </div>
              )}
            </div>
          ))
        ) : (
          // Show only the selected item if it's not "Overview"
          selectedItem && (
            <div className="relative p-4 border rounded bg-gray-50 col-span-full md:col-span-1">
              <h3 className="text-lg font-bold">{selectedItem}</h3>
              <p>Content for {selectedItem}</p>

              {/* Right-Aligned Content for Selected Item */}
              {selectedItem === "All Sales" && (
                <span className="absolute top-2 right-2 text-sm text-gray-600">Sales</span>
              )}
              {selectedItem === "Invoices" && (
                <select className="absolute top-2 right-2 border p-1 rounded">
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              )}
              {selectedItem === "Estimates" && (
                <div className="absolute top-2 right-2 space-x-2">
                  <button className="px-2 py-1 bg-green-500 text-white rounded">Accept</button>
                  <button className="px-2 py-1 bg-red-500 text-white rounded">Reject</button>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default HorizontalMenu;
