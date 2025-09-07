import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react"; // ✅ Lucide Send icon
import Navbar from "../components/Navbar";
export default function ChatbotPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const suggestedPrompts = [
    "Find me a React developer in Bangalore",
    "Match me with someone for DSA practice",
    "Suggest a partner for a weekend hackathon",
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // simulate bot response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "🤖 Codemate AI: I found a coding partner for you!",
        },
      ]);
    }, 1500);
  };

  return (
    <>
      <Navbar/>
      <div className="pt-[72px] h-screen bg-[#F9FAFB] flex flex-col w-full">
        {/* Chat container FULLSCREEN */}
        <div className="flex-1 flex flex-col w-full h-full bg-white shadow-inner">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-600">
                <span className="text-6xl">👋</span>
                <h3 className="text-2xl font-semibold mt-3">
                  Hi coder, welcome to Codemate!
                </h3>
                <p className="text-gray-500 mt-1">How can I help you?</p>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-xl inline-block max-w-xs sm:max-w-md break-words ${
                        msg.sender === "user"
                          ? "bg-teal-500 text-white"
                          : "bg-[#F9FAFB] text-[#111827] border"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start items-center gap-2 text-gray-500 text-sm">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-400"></span>
                    <span>Codemate AI is typing...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </>
            )}
          </div>

          {/* Suggested Prompts */}
          {messages.length === 0 && (
            <div className="flex gap-2 p-3 border-t bg-gray-50 overflow-x-auto">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  className="px-3 py-1 text-sm bg-[#F9FAFB] border rounded-full hover:bg-gray-100 text-[#111827] whitespace-nowrap"
                  onClick={() => setInput(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div className="p-4 border-t flex items-center gap-2 bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Codemate AI to find your coding partner..."
              className="flex-1 border rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 text-[#111827]"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              className="p-3 rounded-full bg-teal-500 text-white hover:bg-teal-600 transition"
            >
              <Send size={22} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
