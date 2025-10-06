import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#f7b32b] dark:bg-gray-900 text-white py-3 text-center fixed bottom-0 right-0 w-full z-40">
      <p>© {new Date().getFullYear()} Dashboard. All Rights Reserved.</p>
    </footer>


  );
};

export default Footer;
