// server/models/Conversation.js
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ConversationSchema = new Schema(
  {
    participants: [{ type: String, required: true }], // user IDs
    lastMessage: {
      text: String,
      senderId: String,
      createdAt: { type: Date, default: Date.now },
    },
    unreadCounts: {
      // track unread per participant
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", ConversationSchema);
export default Conversation;
