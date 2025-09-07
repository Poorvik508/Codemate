import React from "react";
import { Users, Bot, MessageSquare, Code2 } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="bg-[#F9FAFB] min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 shadow-sm bg-white">
        <div className="flex items-center space-x-2">
          <Code2 className="text-[#14B8A6]" size={28} />
          <h1 className="text-2xl font-bold text-[#14B8A6]">Codemate</h1>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-8 md:px-16 py-16">
        {/* Left Text */}
        <div className="md:w-1/2 space-y-6 text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-bold text-[#111827] leading-tight">
            Find Your Perfect Coding Partner
          </h2>
          <p className="text-lg text-gray-600">
            Codemate connects developers and students for hackathons, DSA
            practice, and coding projects with AI-powered partner matching.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 border border-[#14B8A6] text-[#14B8A6] rounded-lg hover:bg-[#14B8A6] hover:text-white transition"
            >
              Login
            </button>
          </div>
        </div>

        {/* Right Illustration with Lucide */}
        <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
          <div className="bg-white shadow-lg rounded-2xl p-8 flex flex-col items-center space-y-6">
            <Users size={80} className="text-[#14B8A6]" />
            <p className="text-gray-600 text-center max-w-xs">
              Collaborate with peers, code together, and achieve more with the
              right partner.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-8 md:px-16 py-16">
        <h3 className="text-3xl font-bold text-center text-[#111827] mb-12">
          Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition flex flex-col items-center">
            <Users size={40} className="text-[#14B8A6] mb-4" />
            <h4 className="text-xl font-semibold text-[#14B8A6] mb-2 text-center">
              Find Compatible Partners
            </h4>
            <p className="text-gray-600 text-center">
              Match based on skills, location, and availability.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition flex flex-col items-center">
            <Bot size={40} className="text-[#14B8A6] mb-4" />
            <h4 className="text-xl font-semibold text-[#14B8A6] mb-2 text-center">
              AI-Powered Chatbot
            </h4>
            <p className="text-gray-600 text-center">
              Search for partners using natural language prompts.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition flex flex-col items-center">
            <MessageSquare size={40} className="text-[#14B8A6] mb-4" />
            <h4 className="text-xl font-semibold text-[#14B8A6] mb-2 text-center">
              Instant Messaging
            </h4>
            <p className="text-gray-600 text-center">
              Chat instantly with matched partners.
            </p>
          </div>
        </div>
      </section>

      {/* Why Codemate Section */}
      <section className="px-8 md:px-16 py-16 bg-white">
        <h3 className="text-3xl font-bold text-center text-[#111827] mb-6">
          Why Codemate?
        </h3>
        <p className="text-center max-w-2xl mx-auto text-gray-600 text-lg">
          Unlike random partner searches, Codemate ensures you connect with
          people who truly match your skills, goals, and availability – making
          collaborations smoother and more successful.
        </p>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#F9FAFB] border-t border-gray-200 py-6 px-8 text-center text-gray-600">
        <div className="flex justify-center space-x-6 mb-4">
          <a href="#" className="hover:text-[#14B8A6]">
            About
          </a>
          <a href="#" className="hover:text-[#14B8A6]">
            Contact
          </a>
          <a href="#" className="hover:text-[#14B8A6]">
            Privacy Policy
          </a>
        </div>
        <p>© 2025 Codemate. All rights reserved.</p>
      </footer>
    </div>
  );
}
