import React from 'react'
import { assets } from "../assets/assets";
const Landingpage = () => {
  return (
    <div className="w-full h-full bg-[#F9FAFB]">
      {/* Header */}
      <p className="p-4 text-gray-900 font-extrabold text-2xl">CODEMATE</p>

      {/* Hero Section */}
      <div className="flex items-center justify-between px-8">
        {/* Left Text */}
        <div className="pt-20 ">
          <p className="text-gray-900 font-bold text-4xl">
            Ready To Find Your Perfect Coding Partner?
          </p>
          <p className="text-gray-900 text-2xl font-semibold pt-8 leading-relaxed">
            Join Codemate today and start finding your perfect coding partner.
          </p>

          <div className="flex items-center justify-center mt-12">
            <button className="border border-black font-semibold text-gray-900 bg-[#14B8A6] px-6 py-3 rounded-full shadow-md hover:bg-[#0d9488] transition">
              GET STARTED
            </button>
          </div>
        </div>

        {/* Right Image */}
        <img
          className="ml-10 w-[30%] h-[30%] object-contain"
          src={assets.programer}
          alt="programmer illustration"
        />
      </div>

      {/* Feature Box */}
      <div className="p-6 border-2 border-gray-300 rounded-xl flex w-[80%] gap-8 items-center m-auto mt-16 shadow-sm bg-white">
        <img
          src={assets.person_icon}
          className="invert w-12 h-12"
          alt="person icon"
        />
        <div>
          <p className="text-xl font-semibold">Find Compatible Partners</p>
          <p className="pt-4 font-medium leading-relaxed">
            Codemate is an AI-assisted platform that helps you find the right
            coding partner for hackathons, DSA practice, or projects. You can
            create a profile with your skills, location, and availability to
            make matching easier. An AI chatbot understands your needs and
            suggests the most relevant profiles. Once matched, you can connect
            instantly through our built-in real-time messaging system.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Landingpage
