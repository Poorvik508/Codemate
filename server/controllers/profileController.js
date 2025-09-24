import User from "../models/userModel.js";
import axios from "axios";
import cloudinary from "../utilities/cloudnary.js";
export const getProfileData = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .select("name email college location availability bio profilePic skills");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Convert the Mongoose document to a plain object
        const userObject = user.toObject();

        // Transform the skills array to only include the skill names
        if (userObject.skills) {
            userObject.skills = userObject.skills.map(skill => skill.name);
        }
    
        res.json({ success: true, user: userObject });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}
export const updateProfile=async (req, res) => {
  try {
      const userId = req.userId;
      const { name, email, college, location, availability, bio } = req.body;
    
    // This is the correct way to print the bio to the console
    console.log("Received Bio:", bio)

    const updateFields = {};
    const allowedFields = ['name', 'email', 'college', 'location', 'availability', 'bio'];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    }

    // Handle profile picture update
    if (req.files && req.files.profilePic) {
      const file = req.files.profilePic;
      const result = await cloudinary.uploader.upload(file.tempFilePath);
      updateFields.profilePic = result.secure_url;
    }
    
    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ success: false, message: "No fields to update." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true }
    );

    // Manually select and transform the user object for the response
    const userObject = {
      name: updatedUser.name,
      email: updatedUser.email,
      college: updatedUser.college,
      location: updatedUser.location,
      availability: updatedUser.availability,
      bio: updatedUser.bio,
      profilePic: updatedUser.profilePic,
      skills: updatedUser.skills.map(skill => skill.name)
    };

    res.json({ success: true, user: userObject });
  } catch (err) {
    console.error("Profile update failed:", err.message);
    res.status(500).json({ success: false, message: "Failed to update profile." });
  }
}
export const addSkill=async (req, res) => {
  try {
    const { skill } = req.body;
    if (!skill) return res.status(400).json({ success: false, message: "Skill is required" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Prevent duplicates
    if (user.skills.some((s) => s.name.toLowerCase() === skill.toLowerCase())) {
      return res.status(400).json({ success: false, message: "Skill already exists" });
    }

    // Correct Call to Gemini API to generate vector
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`,
      {
        "content": {
          "parts": [
            { "text": skill }
          ]
        }
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const vector = response.data.embedding?.values || [];

    user.skills.push({ name: skill, vector });
    await user.save();

    // Prepare the response to only return skill names, not vectors
    const skillsWithoutVectors = user.skills.map(s => s.name);

    res.json({ success: true, skills: skillsWithoutVectors });
  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Failed to add skill" });
  }
}
export const deleteSkill= async (req, res) => {
  try {
    const { skill } = req.params;
    console.log("deleted skill", { skill })

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.skills = user.skills.filter((s) => s.name.toLowerCase() !== skill.toLowerCase());
    await user.save();

    // Corrected line: Map to return only the skill names
    const skillsWithoutVectors = user.skills.map(s => s.name);

    res.json({ success: true, skills: skillsWithoutVectors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}