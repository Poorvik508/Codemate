// src/pages/Messages.jsx
import React, { useEffect, useState } from "react";
import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const navigate=useNavigate()

  // Dummy conversations
  useEffect(() => {
    const dummyConversations = [
      {
        _id: "1",
        participants: ["UserA", "UserB"],
        lastMessage: { text: "Hey, how are you?", senderId: "UserA" },
      },
      {
        _id: "2",
        participants: ["UserC", "UserD"],
        lastMessage: {
          text: "Let's finish the project tomorrow.",
          senderId: "UserD",
        },
      },
      {
        _id: "3",
        participants: ["UserE", "UserF"],
        lastMessage: {
          text: "Don't forget the meeting at 5 PM.",
          senderId: "UserE",
        },
      },
      
    ];

    setConversations(dummyConversations);
    setActiveConversationId(dummyConversations[0]._id);
  }, []);

  return (
    <div className="h-screen flex bg-[#F9FAFB]">
      {/* Left Sidebar */}
      <div className="w-1/4 min-w-[260px] h-screen border-r bg-white overflow-y-auto">
        <div className="flex justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-[#111827]">Messages</h2>
          <button
            onClick={() => navigate("/chat-bot")}
            className="p-2 rounded-full  hover:bg-gray-100 transition"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={(id) => setActiveConversationId(id)}
        />
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 flex flex-col h-screen relative">
        {activeConversationId ? (
          <ChatWindow
            key={activeConversationId}
            conversationId={activeConversationId}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-600">
            No conversations yet.
          </div>
        )}
      </div>
    </div>
  );
}
