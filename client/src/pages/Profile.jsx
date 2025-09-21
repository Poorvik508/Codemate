import React, { useState,useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";

import axios from "axios";
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
  const { backendUrl } = useContext(AppContext);
  const [user, setUser] = useState({
    profilePic: "",
    name: "", // Initialize with empty strings
    email: "",
    college: "",
    location: "",
    availability: "",
    skills: [], // Initialize with an empty array
    bio: "",
  });
  const [newSkill, setNewSkill] = useState("");
  const [selectedPic, setSelectedPic] = useState(null);

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      // Headers are no longer needed due to withCredentials
      const res = await axios.get(backendUrl + "/api/profile/profile");
      setUser(res.data.user);
    } catch (err) {
      console.error("Failed to fetch user data", err);
    }
  };


  // useEffect to run fetchUserData when the component mounts
  useEffect(() => {
    fetchUserData();
  }, []); // The empty array [] ensures this runs only once
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      // Append all user data
      for (const key in user) {
        if (key !== "skills") {
          // We'll handle skills separately if needed
          formData.append(key, user[key]);
        }
      }

      // Append the new image file if one was selected
      if (selectedPic) {
        formData.append("profilePic", selectedPic);
      }
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
      const res = await axios.put(
        backendUrl + "/api/profile/profile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUser(res.data.user);
      setIsEditing(false);
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const addSkill = async () => {
    if (newSkill.trim() && !user.skills.includes(newSkill.trim())) {
      try {
        const res = await axios.post(backendUrl + "/api/profile/skills", {
          skill: newSkill.trim(),
        });
        setUser((prev) => ({ ...prev, skills: res.data.skills }));
        setNewSkill("");
      } catch (err) {
        console.error("Failed to add skill", err);
      }
    }
  };

  const removeSkill = async (skill) => {
    try {
      const res = await axios.delete(
        backendUrl + `/api/profile/skills/${skill}`
      );
      setUser((prev) => ({ ...prev, skills: res.data.skills }));
    } catch (err) {
      console.error("Failed to delete skill", err);
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPic(file);
      // Create a local preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser((prev) => ({ ...prev, profilePic: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] w-full">
      <Navbar />

      <main className="pt-28 px-4 sm:px-8 lg:px-16 w-full space-y-10">
        <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full">
          <img
            src={user.profilePic || assets.avatar}
            alt="Profile"
            className="w-40 h-40 sm:w-48 sm:h-48 rounded-full object-cover shadow"
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

        <div className="bg-white shadow-lg rounded-xl p-6 w-full max-h-60 overflow-y-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">About Me</h3>
          <p className="text-gray-700 leading-relaxed">{user.about}</p>
        </div>

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

      {isOwnProfile && isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start overflow-y-auto py-20 px-4 sm:px-8">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 relative shadow-lg">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex flex-col items-center mb-4">
                <img
                  src={user.profilePic ||assets.avatar}
                  alt="Profile"
                  className="w-40 h-40 sm:w-48 sm:h-48 rounded-full object-cover shadow mb-2"
                />
                <label className="cursor-pointer px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-700 transition text-sm">
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePicChange}
                  />
                </label>
              </div>

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
