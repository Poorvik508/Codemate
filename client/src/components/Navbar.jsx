import React from "react";
import { Code2, MessageCircle, CircleUserRound } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 py-4 shadow-sm bg-white">
      {/* Left: Logo */}
      <div className="flex items-center space-x-2">
        <Code2 className="text-[#14B8A6]" size={28} />
        <h1 className="text-2xl font-bold text-[#14B8A6]">Codemate</h1>
      </div>

      {/* Right: Icons */}
      <div className="flex items-center space-x-6">
        <button className="p-2 rounded-full hover:bg-gray-100 transition">
          <MessageCircle size={24} className="text-[#111827]" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 transition">
          <CircleUserRound size={24} className="text-[#111827]" />
        </button>
      </div>
    </nav>
  );
}
