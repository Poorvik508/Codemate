import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

// Fetch all conversations for logged-in user
export const getConversations = async (req, res) => {
  try {
    // Assume req.user is set by auth middleware
    const userId = req.user._id;

    const conversations = await Conversation.find({ participants: userId })
      .populate("participants", "name avatar online")
      .sort({ updatedAt: -1 });

    res.json({ conversations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

// Fetch messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId }).sort({
      createdAt: 1,
    });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    const senderId = req.user._id; // assume auth middleware sets req.user

    const newMessage = await Message.create({
      conversationId,
      senderId,
      text,
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text,
      updatedAt: Date.now(),
    });

    res.json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
};
