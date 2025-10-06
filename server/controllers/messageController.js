// import Conversation from "../models/Conversation.js";
// import Message from "../models/Message.js";
// import User from "../models/userModel.js"; // Import the User model
// import mongoose from "mongoose";

// // Create or get an existing conversation
// export const createConversation = async (req, res) => {
//   try {
//     const userId = req.userId; // Logged-in user
//     const { recipientId } = req.body;

//     if (!recipientId || !userId) {
//       return res.status(400).json({ error: "Recipient ID is required" });
//     }

//     // Find if a conversation already exists
//     let conversation = await Conversation.findOne({
//       participants: { $all: [userId, recipientId] },
//     });

//     if (!conversation) {
//       // If not, create a new conversation
//       conversation = await Conversation.create({
//         participants: [userId, recipientId],
//         lastMessage: { text: "Conversation created.", senderId: userId },
//       });
//     }

//     res.status(200).json({ conversationId: conversation._id });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to create conversation" });
//   }
// };

// // Fetch all conversations for logged-in user
// export const getConversations = async (req, res) => {
//   try {
//     const userId = req.userId;

//     const conversations = await Conversation.find({
//       participants: new mongoose.Types.ObjectId(userId),
//     })
//       .populate("participants", "name profilePic online") // Populate with necessary fields
//       .sort({ updatedAt: -1 });

//     const formattedConversations = conversations.map((conv) => {
//       const partner = conv.participants.find(
//         (p) => p._id.toString() !== userId.toString()
//       );
      
//       // Add a robust check for the partner
//       const partnerInfo = partner
//         ? {
//             id: partner._id,
//             name: partner.name,
//             profilePic: partner.profilePic,
//             online: partner.online,
//           }
//         : {
//             id: "unknown",
//             name: "Unknown",
//             profilePic: null,
//             online: false,
//           };

//       return {
//         _id: conv._id,
//         partner: partnerInfo,
//         lastMessage: conv.lastMessage,
//         updatedAt: conv.updatedAt,
//       };
//     });

//     res.json({ conversations: formattedConversations });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch conversations" });
//   }
// };

// // Fetch messages for a conversation
// export const getMessages = async (req, res) => {
//   try {
//     const { conversationId } = req.params;
//     const messages = await Message.find({ conversationId }).sort({
//       createdAt: 1,
//     });

//     res.json(messages);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch messages" });
//   }
// };

// // Send a message
// export const sendMessage = async (req, res) => {
//   try {
//     const { conversationId, text } = req.body;
//     const senderId = req.userId;

//     const newMessage = await Message.create({
//       conversationId,
//       senderId,
//       text,
//     });

//     await Conversation.findByIdAndUpdate(conversationId, {
//       lastMessage: { text: text, senderId: senderId }, // Updated to match schema
//       updatedAt: Date.now(),
//     });

//     res.json(newMessage);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to send message" });
//   }
// };
import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import User from "../models/userModel.js";
import Message from "../models/Message.js";

// Create or get an existing conversation
export const createConversation = async (req, res) => {
  try {
    const userId = req.userId; // Logged-in user is a string
    const { recipientId } = req.body;

    if (!recipientId || !userId) {
      return res.status(400).json({ error: "Recipient ID is required" });
    }

    // A more robust way to check for an existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] }
    });

    if (!conversation) {
      // If not, create a new conversation
      conversation = await Conversation.create({
        participants: [userId, recipientId],
        lastMessage: { text: "Conversation created.", senderId: userId },
      });
    }

    res.status(200).json({ conversationId: conversation._id });
  } catch (err) {
    // console.error(err);
    res.status(500).json({ error: "Failed to create conversation" });
  }
};

// Fetch all conversations for logged-in user
export const getConversations = async (req, res) => {
  try {
    const userId = req.userId;

    const conversations = await Conversation.find({
      participants: userId, // Use the string userId directly in the query
    })
      .populate("participants", "name profilePic online")
      .sort({ updatedAt: -1 });

    const formattedConversations = conversations.map((conv) => {
      const partner = conv.participants.find(
        (p) => p._id.toString() !== userId.toString()
      );
      
      const partnerInfo = partner
        ? {
            id: partner._id,
            name: partner.name,
            profilePic: partner.profilePic,
            online: partner.online,
          }
        : {
            id: "unknown",
            name: "Unknown",
            profilePic: null,
            online: false,
          };

      return {
        _id: conv._id,
        partner: partnerInfo,
        lastMessage: conv.lastMessage,
        updatedAt: conv.updatedAt,
      };
    });

    res.json({ conversations: formattedConversations });
  } catch (err) {
    // console.error(err);
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
    // console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    const senderId = req.userId;

    const newMessage = await Message.create({
      conversationId,
      senderId,
      text,
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: { text: text, senderId: senderId },
      updatedAt: Date.now(),
    });

    res.json(newMessage);
  } catch (err) {
    // console.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
};
