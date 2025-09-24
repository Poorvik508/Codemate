import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ConversationSchema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    lastMessage: {
      text: String,
      senderId: { type: Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date, default: Date.now },
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", ConversationSchema);
export default Conversation;
