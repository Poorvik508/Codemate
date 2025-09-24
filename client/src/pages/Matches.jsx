// import React, { useState } from "react";
// import { MapPin, Clock, User } from "lucide-react";
// import Navbar from "../components/Navbar";

// const matchesData = [
//   {
//     id: 1,
//     name: "Sarah Chen",
//     college: "MIT Computer Science",
//     skills: ["React", "TypeScript", "Python", "Machine Learning"],
//     location: "Boston, MA",
//     availability: "Weekends & Evenings",
//   },
//   {
//     id: 2,
//     name: "Alex Rodriguez",
//     college: "Stanford University",
//     skills: ["Java", "Spring Boot", "Docker", "Kubernetes"],
//     location: "San Francisco, CA",
//     availability: "Flexible schedule",
//   },
//   {
//     id: 3,
//     name: "Emily Johnson",
//     college: "UC Berkeley",
//     skills: ["Python", "Django", "PostgreSQL", "Data Science"],
//     location: "Oakland, CA",
//     availability: "Mornings & Afternoons",
//   },
//   {
//     id: 4,
//     name: "David Kim",
//     college: "Carnegie Mellon University",
//     skills: ["C++", "Rust", "System Design", "Blockchain"],
//     location: "Pittsburgh, PA",
//     availability: "Evening hours",
//   },
//   {
//     id: 5,
//     name: "Lisa Wang",
//     college: "Harvard University",
//     skills: ["JavaScript", "Vue.js", "Node.js", "MongoDB"],
//     location: "Cambridge, MA",
//     availability: "Weekend projects",
//   },
//   {
//     id: 6,
//     name: "Michael Brown",
//     college: "Georgia Tech",
//     skills: ["Flutter", "Dart", "Firebase", "Mobile Development"],
//     location: "Atlanta, GA",
//     availability: "Part-time availability",
//   },
// ];

// export default function MatchesPage() {
//   const [sortBy, setSortBy] = useState("Best Match");

//   const sortedMatches = [...matchesData].sort((a, b) => {
//     if (sortBy === "College") return a.college.localeCompare(b.college);
//     if (sortBy === "Location") return a.location.localeCompare(b.location);
//     return 0; // Best Match = default order
//   });

//   return (
//     <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
//       {/* Navbar */}
//       <Navbar />

//       {/* Main Content */}
//       <main className="flex-1 p-6 pt-[88px] w-full">
//         {/* Header */}
//         <div className="w-full mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//           <div>
//             <h1 className="text-2xl font-bold text-[#111827]">Your Matches</h1>
//             <p className="text-gray-600">
//               Found {sortedMatches.length} coding partners that match your
//               skills and preferences
//             </p>
//           </div>

//           {/* Sorting Dropdown */}
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
//           >
//             <option>Best Match</option>
//             <option>College</option>
//             <option>Location</option>
//           </select>
//         </div>

//         {/* Matches Grid - Full Width with 4 columns */}
//         {sortedMatches.length > 0 ? (
//           <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
//             {sortedMatches.map((match) => (
//               <div
//                 key={match.id}
//                 className="bg-white shadow rounded-xl p-5 flex flex-col justify-between w-full"
//               >
//                 {/* Profile Info */}
//                 <div>
//                   <div className="flex items-center gap-3 mb-3">
//                     <div className="w-12 h-12 flex items-center justify-center rounded-full bg-teal-100 text-teal-600 font-bold">
//                       {match.name
//                         .split(" ")
//                         .map((n) => n[0])
//                         .join("")}
//                     </div>
//                     <div>
//                       <h2 className="font-semibold text-[#111827]">
//                         {match.name}
//                       </h2>
//                       <p className="text-gray-600 text-sm">{match.college}</p>
//                     </div>
//                   </div>

//                   {/* Skills */}
//                   <div className="flex flex-wrap gap-2 mb-3">
//                     {match.skills.map((skill, i) => (
//                       <span
//                         key={i}
//                         className="px-2 py-1 text-xs bg-[#F9FAFB] border rounded-full text-gray-700"
//                       >
//                         #{skill}
//                       </span>
//                     ))}
//                   </div>

//                   {/* Location & Availability */}
//                   <div className="flex items-center text-sm text-gray-600 gap-2 mb-1">
//                     <MapPin size={16} />
//                     {match.location}
//                   </div>
//                   <div className="flex items-center text-sm text-gray-600 gap-2 mb-4">
//                     <Clock size={16} />
//                     {match.availability}
//                   </div>
//                 </div>

//                 {/* Actions */}
//                 <div className="flex gap-3 mt-auto">
//                   <button className="flex-1 flex items-center justify-center gap-2 border rounded-lg py-2 hover:bg-gray-50 transition">
//                     <User size={16} />
//                     View Profile
//                   </button>
//                   <button className="flex-1 bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition">
//                     Message
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center text-gray-600 mt-20">
//             No matches found. Try refining your search.
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useNavigate
import Navbar from "../components/Navbar";
import { assets } from "../assets/assets";
import { Mail, MapPin, GraduationCap, User, Clock } from "lucide-react"; // Import Clock and User icons

export default function MatchesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const matches = location.state?.matches || [];
  const [sortBy, setSortBy] = useState("Best Match");

  const sortedMatches = [...matches].sort((a, b) => {
    if (sortBy === "College")
      return a.user.college.localeCompare(b.user.college);
    if (sortBy === "Location")
      return a.user.location.localeCompare(b.user.location);
    if (sortBy === "Score") return b.score - a.score;
    return b.score - a.score; // Best Match = sort by score descending
  });

  if (matches.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] w-full pt-[72px] flex flex-col items-center justify-center text-center text-gray-600">
        <Navbar />
        <p className="mt-8">No matches found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Navbar />
      <main className="flex-1 p-6 pt-[88px] w-full">
        <div className="w-full mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">All Matches</h1>
            <p className="text-gray-600">
              Found {matches.length} coding partners that match your request.
            </p>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
          >
            <option>Best Match</option>
            <option>College</option>
            <option>Location</option>
          </select>
        </div>

        {sortedMatches.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
            {sortedMatches.map((match, index) => (
              <div
                key={index}
                className="bg-white shadow rounded-xl p-5 flex flex-col justify-between w-full"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={match.user.profilePic || assets.avatar}
                      alt={match.user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h2 className="font-semibold text-[#111827]">
                        {match.user.name}
                      </h2>
                      <p className="text-gray-600 text-sm">
                        {match.user.college}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <p className="px-2 py-1 text-xs bg-[#F9FAFB] border rounded-full text-gray-700">
                      #{match.matchingSkill}
                    </p>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 gap-2 mb-1">
                    <MapPin size={16} />
                    {match.user.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 gap-2 mb-4">
                    <Clock size={16} />
                    {match.user.availability}
                  </div>
                </div>

                <div className="flex gap-3 mt-auto">
                  <button
                    className="flex-1 flex items-center justify-center gap-2 border rounded-lg py-2 hover:bg-gray-50 transition"
                    onClick={() => navigate(`/profile/${match.user.id}`)}
                  >
                    <User size={16} />
                    View Profile
                  </button>
                  <button className="flex-1 bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition">
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600 mt-20">
            No matches found. Try refining your search.
          </div>
        )}
      </main>
    </div>
  );
}
