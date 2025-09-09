// src/components/MessageBubble.jsx
import React from "react";

export default function MessageBubble({ message, isOwn }) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`inline-block px-4 py-3 rounded-xl max-w-[70%] break-words ${
          isOwn
            ? "bg-[#14B8A6] text-white rounded-br-none"
            : "bg-[#E5E7EB] text-[#111827] rounded-bl-none"
        }`}
      >
        <div className="whitespace-pre-wrap">{message.text}</div>
        <div
          className={`text-[11px] mt-2 ${
            isOwn ? "text-white/80" : "text-gray-600"
          }`}
        >
          {time}
        </div>
      </div>
    </div>
  );
}
