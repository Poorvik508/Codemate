import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res.json({ success: false, message: "User Not Found" });
    }

    return res.json({
      success: true,
      userdata: {
        name: user.name,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
import User from "../models/userModel.js";

// Helper function to calculate cosine similarity (you can move this to a shared utils file)
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

// Helper to format user data for the frontend
const formatUserForFeed = (user) => {
    if (!user) return null;
    return {
        _id: user._id,
        name: user.name,
        profilePic: user.profilePic,
        bio: user.bio,
        // You can add other fields needed for the MatchCard here
    };
};

export const getDiscoverFeed = async (req, res) => {
  try {
    const loggedInUserId = req.userId;

    // 1. Fetch the logged-in user's full profile
    const loggedInUser = await User.findById(loggedInUserId);
    if (!loggedInUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // --- Define the different matching queries ---

    // Query 1: Find by Skill Similarity
    const findBySkill = async () => {
        const allOtherUsers = await User.find({ _id: { $ne: loggedInUserId } });
        const skillMatches = [];

        allOtherUsers.forEach(user => {
            let totalSimilarity = 0;
            let matchCount = 0;

            loggedInUser.skills.forEach(mySkill => {
                user.skills.forEach(theirSkill => {
                    const similarity = calculateCosineSimilarity(mySkill.vector, theirSkill.vector);
                    if (similarity > 0.7) { // Set a threshold for a "good" match
                        totalSimilarity += similarity;
                        matchCount++;
                    }
                });
            });

            if (matchCount > 0) {
                const averageSimilarity = totalSimilarity / matchCount;
                skillMatches.push({ user, score: averageSimilarity });
            }
        });

        // Sort by score and take the top 10
        return skillMatches
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map(match => formatUserForFeed(match.user));
    };

    // Query 2: Find by Location
    const findByLocation = async () => {
        if (!loggedInUser.location) return [];
        const users = await User.find({
            _id: { $ne: loggedInUserId },
            location: { $regex: new RegExp(loggedInUser.location, 'i') } // Case-insensitive match
        }).limit(10);
        return users.map(formatUserForFeed);
    };

    // Query 3: Find by College
    const findByCollege = async () => {
        if (!loggedInUser.college) return [];
        const users = await User.find({
            _id: { $ne: loggedInUserId },
            college: { $regex: new RegExp(loggedInUser.college, 'i') }
        }).limit(10);
        return users.map(formatUserForFeed);
    };

    // Query 4: Find by Availability
    const findByAvailability = async () => {
        if (!loggedInUser.availability) return [];
        const users = await User.find({
            _id: { $ne: loggedInUserId },
            availability: loggedInUser.availability
        }).limit(10);
        return users.map(formatUserForFeed);
    };

    // 2. Run all queries in parallel for performance
    const [
        bySkill,
        byLocation,
        byCollege,
        byAvailability
    ] = await Promise.all([
        findBySkill(),
        findByLocation(),
        findByCollege(),
        findByAvailability()
    ]);

    // 3. Send the structured response to the frontend
    res.json({
        success: true,
        feed: {
            bySkill,
            byLocation,
            byCollege,
            byAvailability
        }
    });

  } catch (error) {
    // console.error("Failed to generate discover feed:", error);
    res.status(500).json({ success: false, message: "Server error while generating feed." });
  }
};
// ... (keep all other functions like getDiscoverFeed)

export const filterUsers = async (req, res) => {
    try {
        const loggedInUserId = req.userId;
        // Get all possible query parameters
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

        // ADDED: Handle college filter
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

        const formattedResults = matchedUsers.map(user => {
            const userObject = user.toObject();
            userObject.skills = user.skills.map(skill => skill.name);
            return userObject;
        });
        
        res.json({ success: true, results: formattedResults });

    } catch (error) {
        // console.error("Failed to filter users:", error);
        res.status(500).json({ success: false, message: "Server error during filter." });
    }
};