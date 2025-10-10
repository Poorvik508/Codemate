import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { backendUrl } from "@/config/backendUrl";
import { Match, Message } from "@/types";

// --- UI Components ---
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Send, User, Sparkles, Percent, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const AIChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const defaultMessage: Message = {
    id: 1,
    content: "Hello! I'm your AI coding partner finder. Tell me what you're working on or what skills you're looking for, and I'll help you find the perfect match!",
    isBot: true,
    timestamp: new Date(),
  };

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const storedMessages = localStorage.getItem('aiChatHistory');
      if (storedMessages) {
        return JSON.parse(storedMessages).map((msg: Message) => ({ ...msg, timestamp: new Date(msg.timestamp) }));
      }
    } catch (error) { console.error("Failed to parse chat history from localStorage", error); }
    return [defaultMessage];
  });

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem('aiChatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;
    const userMessage: Message = { id: Date.now(), content: inputValue, isBot: false, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    try {
      const response = await axios.post(`${backendUrl}/api/chatbot/ask`, { message: inputValue });
      const { botResponse, matches } = response.data;
      const botMessage: Message = { id: Date.now() + 1, content: botResponse, isBot: true, timestamp: new Date() };
      if (matches && matches.length > 0) {
        if (matches.length > 3) {
          botMessage.matches = matches.slice(0, 1);
          botMessage.allMatches = matches;
          botMessage.showAllMatchesButton = true;
          botMessage.content = "I've found several potential partners! Here's the top match based on your request:";
        } else {
          botMessage.matches = matches;
        }
      }
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      toast({ title: "Error", description: "Sorry, I couldn't connect to the AI assistant.", variant: "destructive" });
      const errorMessage: Message = { id: Date.now() + 1, content: "Sorry, I'm having trouble connecting right now. Please try again later.", isBot: true, timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const handleClearChat = () => {
    localStorage.removeItem('aiChatHistory');
    setMessages([defaultMessage]);
    toast({ title: "Chat Cleared", description: "You can now start a new conversation." });
  };
  
  const getInitials = (name: string | undefined) => {
    if (!name) return "U";
    const names = name.split(' ');
    if (names.length > 1 && names[1]) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Card className="h-[calc(100vh-4rem)] w-full flex flex-col rounded-none border-0 bg-transparent">
      <CardHeader className="border-b px-4 sm:px-6">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Partner Finder
          </CardTitle>
          {messages.length > 1 && (
            <Button variant="ghost" size="sm" onClick={handleClearChat}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear Chat
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
        <div className="flex-1 overflow-y-auto space-y-6 p-4 sm:p-6">
          
          {messages.length === 1 && (
            <div className="flex flex-col items-center gap-4 my-8">
              <Separator />
              <h3 className="text-lg font-semibold text-muted-foreground mt-4">Quick Start Examples</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-4xl">
                {[ "I'm building a React e-commerce app and need a backend developer", "Looking for a Python mentor to help with machine learning", "Need a design-minded frontend developer for my startup idea", ].map((example, index) => (
                  <Button key={index} variant="outline" className="h-auto p-3 text-left justify-start text-wrap" onClick={() => setInputValue(example)} >
                    {example}
                  </Button>
                ))}
              </div>
              <Separator className="mt-4" />
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 items-start ${!message.isBot && 'justify-end'}`}>
              {message.isBot && ( <Avatar className="h-8 w-8 border"><AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white"><Bot className="h-4 w-4" /></AvatarFallback></Avatar> )}
              <div className={`max-w-md md:max-w-lg ${!message.isBot && 'text-right'}`}>
                <div className={`rounded-lg p-3 inline-block ${ message.isBot ? 'bg-secondary text-secondary-foreground text-left' : 'bg-background border' }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  
                  {message.matches && message.matches.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {message.matches.map((match: Match) => (
                        <Card key={match.user._id} className="p-3 bg-background/50 text-left">
                          <div className="flex items-start gap-3">
                            <Avatar><AvatarImage src={match.user.profilePic} /><AvatarFallback>{getInitials(match.user.name)}</AvatarFallback></Avatar>
                            <div className="flex-1">
                              <p className="font-bold">{match.user.name}</p>
                              <p className="text-xs text-muted-foreground">Match: <span className="font-semibold text-primary">{match.matchingSkill}</span></p>
                            </div>
                            {match.score && match.score > 0 && (
                              <Badge variant="outline" className="border-green-600 text-green-600">
                                  {(match.score * 100).toFixed(0)}%
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Link to={`/profile/${match.user._id}`} className="flex-1"><Button size="sm" variant="outline" className="w-full">Profile</Button></Link>
                            <Link to={`/messaging/${match.user._id}`} className="flex-1"><Button size="sm" className="w-full">Message</Button></Link>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                  
                  {message.showAllMatchesButton && (
                    <Button 
                      className="mt-4 w-full"
                      onClick={() => navigate('/all-matches', { state: { matches: message.allMatches } })}
                    >
                      View All {message.allMatches?.length} Matches
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 px-1">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              {!message.isBot && ( <Avatar className="h-8 w-8 border"><AvatarImage src={user?.profilePic} /><AvatarFallback>{getInitials(user?.name || '')}</AvatarFallback></Avatar> )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 items-start">
              <Avatar className="h-8 w-8 border"><AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white"><Bot className="h-4 w-4" /></AvatarFallback></Avatar>
              <div className="max-w-md md:max-w-lg">
                <div className="rounded-lg p-3 inline-block bg-secondary text-secondary-foreground">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-0"></span>
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-150"></span>
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-300"></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2 p-4 sm:p-6 border-t">
          <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={handleKeyPress} placeholder="I'm building a React app and need a backend developer..." className="flex-1" disabled={isTyping} />
          <Button onClick={handleSendMessage} disabled={isTyping} className="bg-gradient-to-r from-primary to-accent"><Send className="h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIChat;