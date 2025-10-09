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

// Create or get an existing conversation with another user
export const createConversation = async (req, res) => {
  try {
    const userId = req.userId;
    const { recipientId } = req.body;

    if (!recipientId || !userId) {
      return res.status(400).json({ error: "Recipient ID is required" });
    }
    
    // Prevent creating a conversation with oneself
    if (userId.toString() === recipientId.toString()) {
        return res.status(400).json({ error: "Cannot create a conversation with yourself." });
    }

    // Find if a conversation already exists between the two participants
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] }
    });

    if (!conversation) {
      // If not, create a new conversation
      conversation = await Conversation.create({
        participants: [userId, recipientId],
        // Initialize unread counts for both users to 0
        unreadCounts: {
            [userId]: 0,
            [recipientId]: 0,
        }
      });
    }

    res.status(200).json({ conversationId: conversation._id });
  } catch (err) {
    console.error("Create Conversation Error:", err);
    res.status(500).json({ error: "Failed to create conversation" });
  }
};

// Fetch all conversations for the logged-in user
export const getConversations = async (req, res) => {
  try {
    const userId = req.userId;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "name profilePic online")
      .sort({ updatedAt: -1 });

    const formattedConversations = conversations.map((conv) => {
      // Find the other participant (the "partner") in the conversation
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
            name: "Unknown User",
            profilePic: null,
            online: false,
          };

      return {
        _id: conv._id,
        partner: partnerInfo,
        lastMessage: conv.lastMessage,
        updatedAt: conv.updatedAt,
        // Get the unread count for the logged-in user
        unreadCount: conv.unreadCounts.get(userId) || 0,
      };
    });

    res.json({ conversations: formattedConversations });
  } catch (err) {
    console.error("Get Conversations Error:", err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

// Fetch all messages for a specific conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId }).sort({
      createdAt: 1,
    });

    res.json(messages);
  } catch (err) {
    console.error("Get Messages Error:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    const senderId = req.userId;

    if (!conversationId || !text) {
        return res.status(400).json({ error: "Conversation ID and text are required." });
    }

    // Create the new message
    const newMessage = await Message.create({
      conversationId,
      senderId,
      text,
    });

    // Find the conversation to update it
    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
        conversation.lastMessage = { text, senderId, createdAt: new Date() };
        
        // Increment the unread count for every other participant in the conversation
        conversation.participants.forEach(participantId => {
            if (participantId.toString() !== senderId.toString()) {
                const currentCount = conversation.unreadCounts.get(participantId.toString()) || 0;
                conversation.unreadCounts.set(participantId.toString(), currentCount + 1);
            }
        });
        
        await conversation.save();
    }

    res.status(201).json(newMessage);
  } catch (err) {
    console.error("Send Message Error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Mark a conversation's messages as read for the logged-in user
export const markAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.userId;

        const conversation = await Conversation.findById(conversationId);
        
        // If the conversation exists and has an unread count for the user, reset it to 0
        if (conversation && conversation.unreadCounts.has(userId)) {
            conversation.unreadCounts.set(userId, 0);
            await conversation.save();
        }

        res.status(200).json({ success: true, message: "Marked as read." });
    } catch (err) {
        console.error("Mark as Read Error:", err);
        res.status(500).json({ error: "Failed to mark as read." });
    }
};