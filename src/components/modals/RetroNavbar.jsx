import React from "react";
import { Link } from "react-router-dom";

const RetroNavbar = () => {
  return (
    <div className="fixed bottom-0 left-0 w-full h-14 bg-gradient-to-b from-purple-700 to-purple-900 border-t-4 border-fuchsia-500 flex justify-between items-center px-4 font-retro shadow-xl z-50">
      <div className="bg-black border-2 border-pink-600 px-3 py-1 shadow-md">
        <Link to="/" className="text-pink-300 text-xl tracking-widest hover:text-pink-100">
          START
        </Link>
      </div>

      {/* Title in the Center */}
      <h1 className="text-pink-200 text-lg tracking-wider uppercase">
        Simple Web3 OS
      </h1>

      
    </div>
  );
};

export default RetroNavbar;