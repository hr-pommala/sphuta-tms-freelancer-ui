// src/pages/Dashboard.jsx
import React from "react";
import Chart from "react-apexcharts";

const Dashboard = () => {
  // pull saved user info from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="p-6">
      {/* Top bar with username */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {user && (
          <span className="text-gray-800 font-medium">
            {user.fullName || user.email}
          </span>
        )}
      </div>

      {/* Dashboard grid */}
      <div className="grid grid-cols-6 gap-4">
        {/* Row 1 */}
        <div className="col-span-2 bg-white p-4 shadow rounded">
          <h2 className="text-lg font-bold mb-4">SHORTCUTS</h2>
          <ul>
            <li className="flex items-center space-x-2 mb-2">
              <span className="text-green-500">&#9679;</span>
              <span>Get paid online</span>
            </li>
            <li className="flex items-center space-x-2 mb-2">
              <span className="text-green-500">&#9679;</span>
              <span>Create invoice</span>
            </li>
            <li className="flex items-center space-x-2 mb-2">
              <span className="text-green-500">&#9679;</span>
              <span>Record expense</span>
            </li>
            <li className="flex items-center space-x-2 mb-2">
              <span className="text-green-500">&#9679;</span>
              <span>Add bank deposit</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-500">&#9679;</span>
              <span>Create check</span>
            </li>
          </ul>
        </div>

        {/* PROFIT & LOSS */}
        <div className="col-span-4 bg-white p-4 shadow rounded h-[300px]">
          <h2 className="text-lg font-bold mb-4">PROFIT & LOSS</h2>
          <Chart
            type="bar"
            series={[
              { name: "Net Profit", data: [500, 300, 400, 700, 600] },
            ]}
            options={{
              chart: { type: "bar" },
              xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May"] },
            }}
            height={200}
          />
        </div>

        {/* Row 2 */}
        <div className="col-span-2 bg-white p-4 shadow rounded">
          <h2 className="text-lg font-bold mb-4">BANK ACCOUNTS</h2>
          <p>
            Checking: <span className="text-gray-700">-3,621.93</span>
          </p>
          <p>
            Savings: <span className="text-gray-700">$200.00</span>
          </p>
          <p>Updated moments ago.</p>
        </div>

        <div className="col-span-2 bg-white p-4 shadow rounded h-[300px]">
          <h2 className="text-lg font-bold mb-4">EXPENSES</h2>
          <Chart
            type="donut"
            series={[44, 55, 41, 17]}
            options={{
              labels: ["Maintenance", "Repair", "Utilities", "Other"],
            }}
            height={200}
          />
        </div>

        <div className="col-span-2 bg-white p-4 shadow rounded h-[300px]">
          <h2 className="text-lg font-bold mb-4">INSIGHTS</h2>
          <Chart
            type="bar"
            series={[{ name: "Revenue", data: [450, 550, 600, 400, 700] }]}
            options={{
              chart: { type: "bar" },
              xaxis: {
                categories: ["2020", "2021", "2022", "2023", "2024"],
                labels: { rotate: -45 },
              },
            }}
            height={200}
          />
        </div>

        {/* Row 3 */}
        <div className="col-span-4 bg-white p-4 shadow rounded h-[300px]">
          <h2 className="text-lg font-bold mb-4">REVENUE</h2>
          <Chart
            type="bar"
            series={[
              { name: "Online", data: [300, 400, 500, 700, 800] },
              { name: "Offline", data: [200, 300, 400, 600, 700] },
            ]}
            options={{
              chart: { type: "bar" },
              xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May"] },
            }}
            height={200}
          />
        </div>

        <div className="col-span-2 bg-white p-4 shadow rounded h-[300px]">
          <h2 className="text-lg font-bold mb-4">CUSTOMERS</h2>
          <Chart
            type="donut"
            series={[44, 55, 13, 33]}
            options={{
              labels: ["New Customers", "Returning Customers", "Leads", "Other"],
            }}
            height={200}
          />
        </div>

        {/* Row 4 */}
        <div className="col-span-2 bg-white p-4 shadow rounded h-[300px]">
          <h2 className="text-lg font-bold mb-4">MARKETING</h2>
          <Chart
            type="donut"
            series={[44, 33, 54]}
            options={{
              labels: ["Email Campaign", "Social Media", "SEO"],
            }}
            height={200}
          />
        </div>

        <div className="col-span-2 bg-white p-4 shadow rounded h-[300px]">
          <h2 className="text-lg font-bold mb-4">SETTINGS</h2>
          <Chart
            type="bar"
            series={[
              { name: "Settings Usage", data: [20, 40, 60, 80, 100] },
            ]}
            options={{
              chart: { type: "bar" },
              plotOptions: { bar: { dataLabels: { position: "top" } } },
              xaxis: {
                categories: [
                  "Security",
                  "Notifications",
                  "Privacy",
                  "Support",
                  "Other",
                ],
              },
            }}
            height={200}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
