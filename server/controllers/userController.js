

import User from "../models/userModel.js";
import axios from "axios";

// --- Helper Functions ---

const calculateCosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0, magnitudeA = 0, magnitudeB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
};

// CORRECTED: This is now the single source of truth for formatting user data.
// It includes all necessary fields for the frontend cards.
const formatUserForResponse = (user) => {
    if (!user) return null;
    const userObject = user.toObject ? user.toObject() : user;
    return {
        _id: userObject._id,
        name: userObject.name,
        profilePic: userObject.profilePic,
        bio: userObject.bio,
        location: userObject.location,
        availability: userObject.availability,
        college: userObject.college,
        skills: userObject.skills ? userObject.skills.map(s => s.name || s) : [],
    };
};


// --- Controller Functions ---

export const getDiscoverFeed = async (req, res) => {
  try {
    const loggedInUserId = req.userId;
    const loggedInUser = await User.findById(loggedInUserId);

    if (!loggedInUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // --- Define the different matching queries ---
    const findBySkill = async () => {
        const allOtherUsers = await User.find({ _id: { $ne: loggedInUserId } });
        const skillMatches = [];
        allOtherUsers.forEach(user => {
            let totalSimilarity = 0, matchCount = 0;
            loggedInUser.skills.forEach(mySkill => {
                user.skills.forEach(theirSkill => {
                    const similarity = calculateCosineSimilarity(mySkill.vector, theirSkill.vector);
                    if (similarity > 0.7) {
                        totalSimilarity += similarity;
                        matchCount++;
                    }
                });
            });
            if (matchCount > 0) {
                skillMatches.push({ user, score: totalSimilarity / matchCount });
            }
        });
        return skillMatches
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map(match => formatUserForResponse(match.user)); // MODIFIED: Use the correct helper
    };

    const findByLocation = async () => {
        if (!loggedInUser.location) return [];
        const users = await User.find({
            _id: { $ne: loggedInUserId },
            location: { $regex: new RegExp(loggedInUser.location, 'i') }
        }).limit(10);
        return users.map(formatUserForResponse); // MODIFIED: Use the correct helper
    };

    const findByCollege = async () => {
        if (!loggedInUser.college) return [];
        const users = await User.find({
            _id: { $ne: loggedInUserId },
            college: { $regex: new RegExp(loggedInUser.college, 'i') }
        }).limit(10);
        return users.map(formatUserForResponse); // MODIFIED: Use the correct helper
    };

    const findByAvailability = async () => {
        if (!loggedInUser.availability) return [];
        const users = await User.find({
            _id: { $ne: loggedInUserId },
            availability: loggedInUser.availability
        }).limit(10);
        return users.map(formatUserForResponse); // MODIFIED: Use the correct helper
    };

    const [ bySkill, byLocation, byCollege, byAvailability ] = await Promise.all([
        findBySkill(),
        findByLocation(),
        findByCollege(),
        findByAvailability()
    ]);

    res.json({
        success: true,
        feed: { bySkill, byLocation, byCollege, byAvailability }
    });

  } catch (error) {
    console.error("Failed to generate discover feed:", error);
    res.status(500).json({ success: false, message: "Server error while generating feed." });
  }
};

export const filterUsers = async (req, res) => {
    try {
        const loggedInUserId = req.userId;
        const { q, availability, location, college } = req.query;

        const query = { _id: { $ne: loggedInUserId } };
        const conditions = [];

        if (q && typeof q === 'string' && q.trim() !== '') {
            const searchRegex = new RegExp(q, 'i');
            conditions.push({ $or: [{ name: searchRegex }, { 'skills.name': searchRegex }] });
        }
        if (availability && availability !== 'all') {
            conditions.push({ availability: availability });
        }
        if (location && typeof location === 'string' && location.trim() !== '') {
             const locationRegex = new RegExp(location, 'i');
             conditions.push({ location: locationRegex });
        }
        if (college && typeof college === 'string' && college.trim() !== '') {
            const collegeRegex = new RegExp(college, 'i');
            conditions.push({ college: collegeRegex });
       }
        
        if (conditions.length > 0) {
            query.$and = conditions;
        } else {
            return res.json({ success: true, results: [] });
        }

        const matchedUsers = await User.find(query).select("name profilePic bio skills availability location college");
        
        // MODIFIED: Use the correct helper for consistency
        const formattedResults = matchedUsers.map(formatUserForResponse);
        
        res.json({ success: true, results: formattedResults });

    } catch (error) {
        console.error("Failed to filter users:", error);
        res.status(500).json({ success: false, message: "Server error during filter." });
    }
};