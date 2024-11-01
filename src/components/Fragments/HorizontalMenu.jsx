import React, { useState } from 'react';
import { HiOutlineMinus, HiOutlinePlus } from 'react-icons/hi';

const HorizontalMenu = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [minimized, setMinimized] = useState({}); // Track minimize state for each section

  const menuItems = [
    "Overview",
    "All Sales",
    "Invoices",
    "Estimates",
    "Sales Orders",
    "Customers",
    "Product & Services"
  ];

  return (
    <div className="p-4">
      {/* Menu Section */}
      <div className="flex flex-wrap gap-4 mb-4">
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedItem(item);
              setMinimized({}); // Reset minimize state on new selection
            }}
            className={`px-4 py-2 border rounded ${
              selectedItem === item ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Content Section */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[80vh]">
        {selectedItem === "Overview" ? (
          // Show all items in separate divs if "Overview" is selected
          menuItems.map((item, idx) => (
            <div key={idx} className={`border rounded bg-gray-50 relative overflow-hidden h-[300px]`}>
              <div className="flex justify-between items-center p-2">
                <h3 className="text-lg font-bold">{item}</h3>
                {item === "Sales Orders" && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setMinimized((prev) => ({ ...prev, [item]: !prev[item] }))}
                      className="text-sm"
                    >
                      {minimized[item] ? <HiOutlinePlus /> : <HiOutlineMinus />}
                    </button>
                  </div>
                )}
              </div>
              {/* Vertical scroll for each section */}
              <div className={`h-[300px] overflow-y-auto ${minimized[item] ? 'h-10' : 'h-[calc(100%-40px)]'}`}>
                {item === "All Sales" && <span className="text-right p-2">Sales</span>}
                {item === "Invoices" && (
                  <div className="text-right p-2">
                    <select className="border rounded p-1">
                      <option>Select</option>
                      <option>Last 30 days</option>
                      <option>This Month</option>
                      <option>This Year</option>
                    </select>
                  </div>
                )}
                {item === "Estimates" && (
                  <div className="text-right p-2 space-x-2">
                    <button className="border rounded px-2 py-1">Button 1</button>
                    <button className="border rounded px-2 py-1">Button 2</button>
                  </div>
                )}
                {item === "Sales Orders" && (
                  <div className="text-right p-2 space-x-2">

                  </div>
                )}
                {(item !== "All Sales" && item !== "Invoices" && item !== "Estimates" && item !== "Sales Orders") && (
                  <p className="mt-2 p-2">Content for {item}</p>
                )}
              </div>
            </div>
          ))
        ) : (
          // Show only the selected item if it's not "Overview"
          selectedItem && (
            <div className={`border rounded bg-gray-50 relative overflow-hidden`}>
              <div className="flex justify-between items-center p-2">
                <h3 className="text-lg font-bold">{selectedItem}</h3>
                {selectedItem === "Sales Orders" && (
                  <button
                    onClick={() => setMinimized((prev) => ({ ...prev, [selectedItem]: !prev[selectedItem] }))}
                    className="text-sm"
                  >
                    {minimized[selectedItem] ? <HiOutlinePlus /> : <HiOutlineMinus />}
                  </button>
                )}
              </div>
              <div className={`h-[300px] overflow-y-auto ${minimized[selectedItem] ? 'h-10' : 'h-[calc(100%-40px)]'}`}>
                <p className="p-2">Content for {selectedItem}</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default HorizontalMenu;
