// // src/pages/Messages.jsx
// import React, { useEffect, useState } from "react";
// import ConversationList from "../components/ConversationList";
// import ChatWindow from "../components/ChatWindow";
// import { useNavigate } from "react-router-dom";
// import { ArrowLeft } from "lucide-react";

// export default function Messages() {
//   const [conversations, setConversations] = useState([]);
//   const [activeConversationId, setActiveConversationId] = useState(null);
//   const navigate=useNavigate()

//   // Dummy conversations
//   useEffect(() => {
//     const dummyConversations = [
//       {
//         _id: "1",
//         participants: ["UserA", "UserB"],
//         lastMessage: { text: "Hey, how are you?", senderId: "UserA" },
//       },
//       {
//         _id: "2",
//         participants: ["UserC", "UserD"],
//         lastMessage: {
//           text: "Let's finish the project tomorrow.",
//           senderId: "UserD",
//         },
//       },
//       {
//         _id: "3",
//         participants: ["UserE", "UserF"],
//         lastMessage: {
//           text: "Don't forget the meeting at 5 PM.",
//           senderId: "UserE",
//         },
//       },
      
//     ];

//     setConversations(dummyConversations);
//     setActiveConversationId(dummyConversations[0]._id);
//   }, []);

//   return (
//     <div className="h-screen flex bg-[#F9FAFB]">
//       {/* Left Sidebar */}
//       <div className="w-1/4 min-w-[260px] h-screen border-r bg-white overflow-y-auto">
//         <div className="flex justify-between p-4 border-b">
//           <h2 className="text-lg font-semibold text-[#111827]">Messages</h2>
//           <button
//             onClick={() => navigate("/chat-bot")}
//             className="p-2 rounded-full  hover:bg-gray-100 transition"
//           >
//             <ArrowLeft size={20} />
//           </button>
//         </div>
//         <ConversationList
//           conversations={conversations}
//           activeId={activeConversationId}
//           onSelect={(id) => setActiveConversationId(id)}
//         />
//       </div>

//       {/* Right Chat Area */}
//       <div className="flex-1 flex flex-col h-screen relative">
//         {activeConversationId ? (
//           <ChatWindow
//             key={activeConversationId}
//             conversationId={activeConversationId}
//           />
//         ) : (
//           <div className="flex-1 flex items-center justify-center text-gray-600">
//             No conversations yet.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
import React, { useEffect, useState, useContext, useRef } from "react";
import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { io } from "socket.io-client";


export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const { backendUrl, userdata } = useContext(AppContext);
  const navigate = useNavigate();
  const socketRef = useRef();

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/messages/conversations`);
      setConversations(res.data.conversations);
      if (res.data.conversations.length > 0) {
        setActiveConversationId(res.data.conversations[0]._id);
      }
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    }
  };

  useEffect(() => {
    fetchConversations();
    
    // Setup Socket.IO connection
    if (userdata && userdata._id) {
      socketRef.current = io(backendUrl, {
        query: { userId: userdata._id },
        withCredentials: true,
      });

      socketRef.current.on("connect", () => {
        console.log("Connected to Socket.IO server.");
      });

      // Update conversations list on new messages
      socketRef.current.on("receive_message", (message) => {
        setConversations((prevConvs) => {
          const updatedConvs = prevConvs.map((conv) =>
            conv._id === message.conversationId
              ? { ...conv, lastMessage: message, updatedAt: new Date() }
              : conv
          );
          // If the message is for a new conversation, fetch the list again
          if (!updatedConvs.some((conv) => conv._id === message.conversationId)) {
            fetchConversations();
          }
          return updatedConvs;
        });
      });
      
      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [userdata]);

  return (
    <div className="h-screen flex bg-[#F9FAFB]">
      {/* Left Sidebar */}
      <div className="w-1/4 min-w-[260px] h-screen border-r bg-white overflow-y-auto">
        <div className="flex justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-[#111827]">Messages</h2>
          <button
            onClick={() => navigate("/chat-bot")}
            className="p-2 rounded-full hover:bg-gray-100 transition"
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
            socket={socketRef.current}
            onUpdateConversations={fetchConversations}
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
