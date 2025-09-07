import React, { useState } from "react";
import Navbar from "../components/Navbar";
import {
  Mail,
  MapPin,
  GraduationCap,
  Clock,
  Edit3,
  X,
  Plus,
} from "lucide-react";

const ProfilePage = ({ isOwnProfile = true }) => {
  const [isEditing, setIsEditing] = useState(false);

  const [user, setUser] = useState({
    profilePic: "", // can be URL or base64
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
  });

  const [newSkill, setNewSkill] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // API call to save updated profile can be added here
    setIsEditing(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !user.skills.includes(newSkill.trim())) {
      setUser((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skill) => {
    setUser((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] w-full">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="pt-28 px-4 sm:px-8 lg:px-16 w-full space-y-10">
        {/* Profile Card */}
        <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full">
          <img
            src={user.profilePic || "https://via.placeholder.com/120"}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover shadow"
          />
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-3xl font-bold text-gray-900">{user.name}</h2>
            <div className="mt-3 space-y-1 text-gray-600">
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
        <div className="bg-white shadow-lg rounded-xl p-6 w-full max-h-60 overflow-y-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Skills</h3>
          <div className="flex flex-wrap gap-3">
            {user.skills.map((skill, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-teal-500 text-white rounded-full text-sm font-medium whitespace-nowrap"
              >
                #{skill}
              </span>
            ))}
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white shadow-lg rounded-xl p-6 w-full max-h-60 overflow-y-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">About Me</h3>
          <p className="text-gray-700 leading-relaxed">{user.about}</p>
        </div>

        {/* Edit Profile Button (only for own profile) */}
        {isOwnProfile && (
          <div className="flex justify-center">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-700 transition shadow"
            >
              <Edit3 size={18} /> Edit Profile
            </button>
          </div>
        )}
      </main>

      {/* Edit Modal (only for own profile) */}
      {isOwnProfile && isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start overflow-y-auto py-20 px-4 sm:px-8">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 relative shadow-lg">
            {/* Close Button */}
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center mb-4">
                <img
                  src={user.profilePic || "https://via.placeholder.com/120"}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover shadow mb-2"
                />
                <label className="cursor-pointer px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-700 transition text-sm">
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setUser((prev) => ({
                            ...prev,
                            profilePic: reader.result,
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>

              {/* Basic Info */}
              {["name", "email", "college", "location", "availability"].map(
                (field) => (
                  <div key={field}>
                    <label className="block text-gray-700 font-medium mb-1 capitalize">
                      {field}
                    </label>
                    <input
                      type={field === "email" ? "email" : "text"}
                      name={field}
                      value={user[field]}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                )
              )}

              {/* Skills Section with tag chips */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Skills
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add a skill and press Enter"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    className="flex-1 p-2 border rounded"
                  />
                  <button
                    onClick={addSkill}
                    className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-700 flex items-center gap-1"
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>

                <div className="max-h-40 overflow-y-auto flex flex-wrap gap-2 p-2 border rounded">
                  {user.skills.map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-medium"
                    >
                      <span>#{skill}</span>
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-2 hover:bg-teal-700 rounded-full p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* About */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  About Me
                </label>
                <textarea
                  name="about"
                  value={user.about}
                  onChange={handleChange}
                  className="w-full p-2 border rounded resize-none"
                  rows={4}
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded bg-teal-500 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
