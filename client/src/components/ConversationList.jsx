import React from "react";
import { assets } from "../assets/assets";

function ConversationItem({ conv, active, onClick }) {
  const partner = conv.partner || {};
  const last = conv.lastMessage || {};

  return (
    <div
      onClick={() => onClick(conv._id)}
      className={`flex items-center gap-3 p-4 border-b cursor-pointer hover:bg-gray-50 ${
        active ? "border-l-4 border-[#14B8A6] bg-gray-50" : ""
      }`}
    >
      {/* avatar */}
      <img
        src={partner.profilePic || assets.avatar}
        alt={partner.name}
        className="w-10 h-10 rounded-full object-cover"
      />

      <div className="flex-1">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium text-[#111827]">
            {partner.name || "Unknown"}
          </div>
          <div className="text-xs text-gray-400">
            {conv.updatedAt
              ? new Date(conv.updatedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </div>
        </div>
        <div className="text-xs text-gray-500 truncate">
          {last.text || "No messages yet."}
        </div>
      </div>
    </div>
  );
}

export default function ConversationList({
  conversations = [],
  activeId,
  onSelect,
}) {
  if (!conversations.length) {
    return (
      <div className="p-6 text-center text-gray-500">No conversations yet.</div>
    );
  }

  return (
    <div className="overflow-y-auto h-[calc(100vh-64px)]">
      {conversations.map((c) => (
        <ConversationItem
          key={c._id}
          conv={c}
          active={c._id === activeId}
          onClick={onSelect}
        />
      ))}
    </div>
  );
}
