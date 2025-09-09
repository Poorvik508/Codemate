import express from "express";
import {
  getConversations,
  getMessages,
  sendMessage,
} from "../controllers/messageController.js";

const router = express.Router();

// Conversations list
router.get("/conversations", getConversations);

// Messages in a conversation
router.get("/conversations/:conversationId/messages", getMessages);

// Send message
router.post("/send", sendMessage);

export default router;
