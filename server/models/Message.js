// server/models/Message.js
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const MessageSchema = new Schema(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    senderId: { type: String, required: true }, // store user id as string
    text: { type: String, required: true },
  },
  { timestamps: true } // automatically adds createdAt & updatedAt
);

const Message = mongoose.model("Message", MessageSchema);
export default Message;
