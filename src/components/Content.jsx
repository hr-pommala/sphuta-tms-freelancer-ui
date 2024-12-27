import React from "react";

const Content = () => {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Scrollable Content</h1>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin non augue
        sed urna facilisis cursus. Vestibulum vel venenatis erat. Mauris at
        sagittis metus. Sed sit amet leo nisi.
      </p>
      {/* Add more content to demonstrate scrolling */}
      {[...Array(20)].map((_, index) => (
        <p key={index}>
          This is line {index + 1}. Lorem ipsum dolor sit amet, consectetur
          adipiscing elit.
        </p>
      ))}
    </div>
  );
};

export default Content;
