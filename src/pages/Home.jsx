import React from "react";

const Home = () => {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl md:text-3xl font-bold">Home Page</h1>
      <p className="text-sm md:text-base">Welcome to the Home page!</p>
      {/* Add a lot of content to demonstrate scrolling */}
      {[...Array(50)].map((_, index) => (
        <p key={index} className="text-sm md:text-base">
          This is line {index + 1}. Lorem ipsum dolor sit amet, consectetur
          adipiscing elit.
        </p>
      ))}
    </div>
  );
};

export default Home;
