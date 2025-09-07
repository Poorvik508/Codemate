import React from "react";
import { Code2, MessageCircle, CircleUserRound } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 shadow-sm bg-white">
      {/* Left: Logo */}
      <div className="flex items-center space-x-2">
        <Code2 className="text-[#14B8A6]" size={28} />
        <h1 className="text-2xl font-bold text-[#14B8A6]">Codemate</h1>
      </div>

      {/* Right: Icons with labels */}
      <div className="flex items-center space-x-6">
        <button className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition">
          <MessageCircle size={24} className="text-[#111827]" />
          <span className="text-[#111827] font-medium hidden sm:inline">
            Message
          </span>
        </button>
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition"
        >
          <CircleUserRound size={24} className="text-[#111827]" />
          <span className="text-[#111827] font-medium hidden sm:inline">
            Profile
          </span>
        </button>
      </div>
    </nav>
  );
}
