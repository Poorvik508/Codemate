// // src/components/ChatWindow.jsx
// import React, { useEffect, useRef, useState } from "react";
// import MessageBubble from "./MessageBubble";

// export default function ChatWindow({
//   conversationId,
//   socket,
//   onUpdateConversations,
// }) {
//   const [messages, setMessages] = useState([]);
//   const [partner, setPartner] = useState({ name: "Loading...", online: false });
//   const [text, setText] = useState("");
//   const [typing, setTyping] = useState(false);
//   const [sendingError, setSendingError] = useState(null);
//   const chatRef = useRef(null);
//   const inputRef = useRef(null);

//   // helper to fetch messages & conversation metadata
//   const fetchMessages = () => {
//     const token = localStorage.getItem("token");
//     fetch(`/api/conversations/${conversationId}/messages`, {
//       headers: { Authorization: token ? `Bearer ${token}` : "" },
//     })
//       .then((r) => r.json())
//       .then((data) => {
//         setMessages(data.messages || []);
//         if (data.partner) setPartner(data.partner);
//       })
//       .catch((err) => {
//         console.error(err);
//         setSendingError("Failed to load messages");
//       });
//   };

//   useEffect(() => {
//     fetchMessages();
//     // join socket room
//     if (!socket) return;
//     socket.emit("join_conversation", conversationId);

//     // receive message
//     const onReceive = (message) => {
//       if (message.conversationId !== conversationId) return;
//       setMessages((m) => [...m, message]);
//       // optionally update conversation list (unread counts) by refetching or emitting event
//       onUpdateConversations && onUpdateConversations(); // parent can re-fetch list
//     };

//     const onTyping = (payload) => {
//       if (payload.conversationId !== conversationId) return;
//       setTyping(true);
//     };
//     const onStopTyping = (payload) => {
//       if (payload.conversationId !== conversationId) return;
//       setTyping(false);
//     };

//     socket.on("receive_message", onReceive);
//     socket.on("user_typing", onTyping);
//     socket.on("user_stop_typing", onStopTyping);

//     return () => {
//       socket.off("receive_message", onReceive);
//       socket.off("user_typing", onTyping);
//       socket.off("user_stop_typing", onStopTyping);
//       socket.emit("leave_conversation", conversationId);
//     };
//   }, [conversationId, socket]);

//   // auto-scroll
//   useEffect(() => {
//     chatRef.current?.scrollTo({
//       top: chatRef.current.scrollHeight,
//       behavior: "smooth",
//     });
//   }, [messages, typing]);

//   // send message (calls API then emits socket)
//   const sendMessage = () => {
//     if (!text.trim()) return;
//     const token = localStorage.getItem("token");
//     const payload = { conversationId, text: text.trim() };

//     // optimistic UI: append as 'sending' (server will respond with saved message)
//     const tempMsg = {
//       _id: `temp-${Date.now()}`,
//       senderId: "me",
//       text: text.trim(),
//       createdAt: new Date().toISOString(),
//       conversationId,
//     };
//     setMessages((m) => [...m, tempMsg]);
//     setText("");

//     fetch("/api/messages/send", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: token ? `Bearer ${token}` : "",
//       },
//       body: JSON.stringify(payload),
//     })
//       .then((r) => r.json())
//       .then((saved) => {
//         // replace temp message with saved (simple strategy: refetch messages)
//         fetchMessages();
//         // notify socket
//         socket && socket.emit("send_message", saved);
//       })
//       .catch((err) => {
//         console.error(err);
//         setSendingError("Failed to send message");
//       });
//   };

//   // key handling: Enter sends, Shift+Enter newline
//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     } else {
//       // emit typing events
//       socket && socket.emit("user_typing", { conversationId });
//       clearTimeout(handleKeyDown.timeout);
//       handleKeyDown.timeout = setTimeout(() => {
//         socket && socket.emit("user_stop_typing", { conversationId });
//       }, 1000);
//     }
//   };

//   return (
//     <div className="flex-1 flex flex-col">
//       {/* header */}
//       <div className="bg-white border-b p-4 flex items-center gap-3">
//         <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm">
//           {partner.name
//             ? partner.name
//                 .split(" ")
//                 .map((n) => n[0])
//                 .join("")
//             : "U"}
//         </div>
//         <div>
//           <div className="text-sm font-semibold text-[#111827]">
//             {partner.name}
//           </div>
//           <div
//             className={`text-xs ${
//               partner.online ? "text-green-500" : "text-gray-500"
//             }`}
//           >
//             {partner.online ? "Online" : "Offline"}
//           </div>
//         </div>
//       </div>

//       {/* messages list */}
//       <div
//         ref={chatRef}
//         className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F9FAFB]"
//       >
//         {messages.length === 0 ? (
//           <div className="text-center text-gray-500 mt-8">
//             Say hi — start the conversation!
//           </div>
//         ) : (
//           messages.map((m) => (
//             <MessageBubble
//               key={m._id}
//               message={m}
//               isOwn={
//                 m.senderId === "me" ||
//                 m.senderId === (localStorage.getItem("userId") || "me")
//               }
//             />
//           ))
//         )}

//         {typing && <div className="text-sm text-gray-500">Typing…</div>}
//       </div>

//       {/* input bar (fixed inside chat area) */}
//       <div className="bg-white p-4 border-t">
//         {sendingError && (
//           <div className="text-sm text-red-600 mb-2">{sendingError}</div>
//         )}
//         <div className="flex items-end gap-3">
//           <textarea
//             ref={inputRef}
//             value={text}
//             onChange={(e) => setText(e.target.value)}
//             onKeyDown={handleKeyDown}
//             placeholder="Type your message..."
//             rows={1}
//             className="flex-1 resize-none border rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-sm"
//             onInput={(e) => {
//               // auto-grow textarea
//               e.target.style.height = "auto";
//               e.target.style.height = `${Math.min(
//                 e.target.scrollHeight,
//                 200
//               )}px`;
//             }}
//           />
//           <button
//             onClick={sendMessage}
//             className="p-3 rounded-full bg-[#14B8A6] text-white hover:bg-[#0d9488] transition"
//             aria-label="Send"
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="h-5 w-5"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M12 19l9-7-9-7-2 4-7 3 7 3 2 4z"
//               />
//             </svg>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
// src/components/ChatWindow.jsx
// src/components/ChatWindow.jsx
import React, { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ conversationId }) {
  const chatRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);

  // Dummy data
  const dummyPartners = { "1": { name: "UserB", online: true }, "2": { name: "UserD", online: false }, "3": { name: "UserF", online: true } };
  const dummyMessages = {
    "1": [
      { _id: "m1", senderId: "UserA", text: "Hey, how are you?", createdAt: new Date() },
      { _id: "m2", senderId: "UserB", text: "I’m good! How about you?", createdAt: new Date() },
      { _id: "m3", senderId: "UserA", text: "Doing great, thanks!", createdAt: new Date() },
    ],
    "2": [
      { _id: "m1", senderId: "UserC", text: "Did you complete the module?", createdAt: new Date() },
      { _id: "m2", senderId: "UserD", text: "Almost done, will submit tonight.", createdAt: new Date() },
      { _id: "m3", senderId: "UserC", text: "Perfect, thanks!", createdAt: new Date() },
    ],
    "3": [
      { _id: "m1", senderId: "UserE", text: "Don't forget the meeting at 5 PM.", createdAt: new Date() },
      { _id: "m2", senderId: "UserF", text: "Sure, I’ll be there.", createdAt: new Date() },
    ],
  };

  const partner = dummyPartners[conversationId] || { name: "Unknown", online: false };

  useEffect(() => {
    setMessages(dummyMessages[conversationId] || []);
  }, [conversationId]);

  // Auto-scroll
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = () => {
    if (!text.trim()) return;
    const newMsg = { _id: `me-${Date.now()}`, senderId: "me", text, createdAt: new Date() };
    setMessages((m) => [...m, newMsg]);
    setText("");
    setTyping(true);

    setTimeout(() => {
      setMessages((m) => [...m, { _id: `bot-${Date.now()}`, senderId: partner.name, text: "This is a dummy reply.", createdAt: new Date() }]);
      setTyping(false);
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col relative h-screen">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm">
          {partner.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <div>
          <div className="text-sm font-semibold text-[#111827]">{partner.name}</div>
          <div className={`text-xs ${partner.online ? "text-green-500" : "text-gray-500"}`}>
            {partner.online ? "Online" : "Offline"}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={chatRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F9FAFB] mb-24">
        {messages.length === 0 ? <div className="text-center text-gray-500 mt-8">Say hi — start the conversation!</div> : messages.map((m) => <MessageBubble key={m._id} message={m} isOwn={m.senderId === "me"} />)}
        {typing && <div className="text-sm text-gray-500">Typing…</div>}
      </div>

      {/* Input Bar */}
      <div className="absolute bottom-0 left-0 w-full bg-white p-4 border-t flex items-end gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          rows={1}
          className="flex-1 resize-none border rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-sm"
          onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`; }}
        />
        <button onClick={sendMessage} className="p-3 rounded-full bg-[#14B8A6] text-white hover:bg-[#0d9488] transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9-7-9-7-2 4-7 3 7 3 2 4z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
