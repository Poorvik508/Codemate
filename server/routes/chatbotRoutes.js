import express from "express";
import { chatbotResponse } from "../controllers/chatbotController.js";

const router = express.Router();


// Route to get a bot response based on user message
router.post("/ask",chatbotResponse);

export default router;
