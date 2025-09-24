import express from "express";
import userAuth from "../middleware/userauth.js";
import { addSkill, deleteSkill, getProfileData, updateProfile } from "../controllers/profileController.js";

const router = express.Router();

// Get user profile
router.get("/profile", userAuth, getProfileData);
// to update profile info 
router.put("/profile", userAuth, updateProfile);
// Add skill (with vector conversion via Gemini API)
router.post("/skills", userAuth,addSkill );

// Delete skill
router.delete("/skills/:skill", userAuth,deleteSkill);

export default router;
