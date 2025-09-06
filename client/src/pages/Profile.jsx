import React from "react";
import Navbar from "../components/Navbar";
import { Mail, MapPin, GraduationCap, Clock, Edit3 } from "lucide-react";

const ProfilePage = () => {
  const user = {
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    college: "MIT - Computer Science",
    location: "San Francisco, CA",
    availability: "Available for coding sessions",
    skills: [
      "React",
      "TypeScript",
      "JavaScript",
      "Python",
      "Node.js",
      "C++",
      "Machine Learning",
      "AWS",
      "Docker",
      "GraphQL",
      "MongoDB",
      "PostgreSQL",
      "Git",
      "Kubernetes",
      "TensorFlow",
    ],
    about:
      "I'm a passionate full-stack developer with 3+ years of experience building scalable web applications. I love collaborating with fellow developers on challenging projects, especially those involving modern JavaScript frameworks and machine learning integration. Always eager to learn new technologies and share knowledge with the coding community. Looking for coding partners who are enthusiastic about clean code, innovative solutions, and building products that make a difference.",
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Profile Card */}
        <div className="bg-white shadow rounded-xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src="https://via.placeholder.com/120"
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover shadow"
          />
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <div className="mt-2 space-y-1 text-gray-600">
              <p className="flex items-center justify-center sm:justify-start gap-2">
                <Mail size={18} /> {user.email}
              </p>
              <p className="flex items-center justify-center sm:justify-start gap-2">
                <GraduationCap size={18} /> {user.college}
              </p>
              <p className="flex items-center justify-center sm:justify-start gap-2">
                <MapPin size={18} /> {user.location}
              </p>
              <p className="flex items-center justify-center sm:justify-start gap-2 text-green-600 font-medium">
                <Clock size={18} /> {user.availability}
              </p>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
          <div className="flex flex-wrap gap-3">
            {user.skills.map((skill, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-teal-500 text-white rounded-full text-sm font-medium hover:bg-teal-700 transition"
              >
                #{skill}
              </span>
            ))}
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About Me</h3>
          <p className="text-gray-700 leading-relaxed">{user.about}</p>
        </div>

        {/* Edit Profile Button */}
        <div className="flex justify-center">
          <button className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-700 transition shadow">
            <Edit3 size={18} /> Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
