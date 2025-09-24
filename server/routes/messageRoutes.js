import express from "express";
import {
  getConversations,
  getMessages,
  sendMessage,
  createConversation,
} from "../controllers/messageController.js";
import userAuth from "../middleware/userauth.js"; // Import auth middleware

const router = express.Router();

// Conversations list
router.get("/conversations", userAuth, getConversations);

// Create or get conversation with a recipient
router.post("/conversations", userAuth, createConversation);

// Messages in a conversation
router.get("/conversations/:conversationId/messages", userAuth, getMessages);

// Send message
router.post("/send", userAuth, sendMessage);

export default router;
