import express from "express";
import { chatbotResponse } from "../controllers/chatbotController.js";
import userAuth from "../middleware/userauth.js";
const router = express.Router();


// Route to get a bot response based on user message
router.post("/ask",userAuth,chatbotResponse);

export default router;
