import React, { useState, useRef, useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Send } from "lucide-react";

export default function ChatbotPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();

  const suggestedPrompts = [
    "Find me a React developer in Bangalore",
    "Match me with someone for DSA practice",
    "Suggest a partner for a weekend hackathon",
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add the user's message to state
    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await axios.post(backendUrl + "/api/chatbot/ask", {
        message: input,
      });

      const { botResponse, matches } = response.data;

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: botResponse,
          matches: matches,
        },
      ]);
    } catch (err) {
      console.error("Chatbot API error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePromptClick = (prompt) => {
    setInput(prompt);
    handleSend();
  };

  const navigateToMatchesPage = (fullMatches) => {
    navigate("/matches", { state: { matches: fullMatches } });
  };

  const navigateToProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleMessageUser = async (recipientId) => {
    try {
      // API call to create or retrieve a conversation
      const response = await axios.post(
        `${backendUrl}/api/messages/conversations`,
        { recipientId }
      );
      const conversationId = response.data.conversationId;

      // Navigate to the messages page for the new or existing conversation
      navigate(`/messages/${conversationId}`);
    } catch (err) {
      console.error("Failed to start conversation", err);
      alert("Failed to start conversation. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
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

                      {/* Conditional rendering for matches */}
                      {msg.matches && msg.matches.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <p className="text-gray-700 font-semibold">
                            Here are some matches for you:
                          </p>
                          {msg.matches.slice(0, 3).map((match, matchIndex) => (
                            <div
                              key={matchIndex}
                              className="bg-white shadow rounded-lg p-3 flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={match.user.profilePic || assets.avatar}
                                  alt={match.user.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">
                                    {match.user.name}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition"
                                  onClick={() =>
                                    navigateToProfile(match.user.id)
                                  }
                                >
                                  View Profile
                                </button>
                                <button
                                  className="px-3 py-1 text-sm bg-teal-500 text-white rounded-full hover:bg-teal-600 transition"
                                  onClick={() =>
                                    handleMessageUser(match.user.id)
                                  }
                                >
                                  Message
                                </button>
                              </div>
                            </div>
                          ))}
                          {msg.matches.length > 3 && (
                            <div className="text-center mt-4">
                              <button
                                className="text-teal-600 hover:text-teal-800 font-medium transition"
                                onClick={() =>
                                  navigateToMatchesPage(msg.matches)
                                }
                              >
                                See more matches ({msg.matches.length - 3})
                              </button>
                            </div>
                          )}
                        </div>
                      )}
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

          {messages.length === 0 && (
            <div className="flex gap-2 p-3 border-t bg-gray-50 overflow-x-auto">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  className="px-3 py-1 text-sm bg-[#F9FAFB] border rounded-full hover:bg-gray-100 text-[#111827] whitespace-nowrap"
                  onClick={() => handlePromptClick(prompt)}
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
