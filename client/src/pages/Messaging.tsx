import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { io, Socket } from "socket.io-client";
import { backendUrl } from "@/config/backendUrl";

// --- UI Components ---
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Search, Phone, Video, MoreVertical, Loader2, MessageSquare, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

// --- Interfaces to match backend data ---
interface Partner {
  id: string;
  name: string;
  profilePic?: string;
  online: boolean;
}

interface Conversation {
  _id: string;
  partner: Partner;
  lastMessage: {
    text: string;
    senderId: string;
  };
  updatedAt: string;
  unreadCount?: number;
}

interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

const Messaging = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { userId: recipientIdFromUrl } = useParams<{ userId: string }>();
  const socket = useRef<Socket | null>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingConvos, setIsLoadingConvos] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Effect for Socket Connection and Initial Data Fetch ---
  useEffect(() => {
    if (!user) return;

    socket.current = io(backendUrl || "http://localhost:4000", { withCredentials: true });

    const fetchConversations = async () => {
      setIsLoadingConvos(true);
      try {
        const res = await axios.get(`${backendUrl}/api/messages/conversations`);
        setConversations(res.data.conversations);
      } catch (error) {
        console.error("Failed to fetch conversations", error);
        toast({ title: "Error", description: "Could not load conversations.", variant: "destructive" });
      } finally {
        setIsLoadingConvos(false);
      }
    };
    fetchConversations();

    socket.current.on("receive_message", (newMessage: Message) => {
      if (newMessage.senderId !== user?._id) {
        if (newMessage.conversationId === selectedConversationId) {
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
      }
    });

    return () => {
      socket.current?.disconnect();
      socket.current?.off("receive_message");
    };
  }, [user, toast, backendUrl, selectedConversationId]);

  // --- Effect to fetch messages when a conversation is selected ---
  useEffect(() => {
    if (!selectedConversationId) return;

    socket.current?.emit("join_conversation", selectedConversationId);

    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const res = await axios.get(`${backendUrl}/api/messages/conversations/${selectedConversationId}/messages`);
        setMessages(res.data);
      } catch (error) {
        console.error("Failed to fetch messages", error);
        toast({ title: "Error", description: "Could not load messages.", variant: "destructive" });
      } finally {
        setIsLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [selectedConversationId, toast, backendUrl]);

  // --- Effect to handle creating/selecting a conversation from a URL param ---
   useEffect(() => {
    if (recipientIdFromUrl && user && conversations.length > 0) {
      if (recipientIdFromUrl === user._id) return;

      const existingConv = conversations.find(c => c.partner.id === recipientIdFromUrl);
      if (existingConv) {
        setSelectedConversationId(existingConv._id);
      } else {
        const createConv = async () => {
          try {
            const res = await axios.post(`${backendUrl}/api/messages/conversations`, { recipientId: recipientIdFromUrl });
            const updatedConvos = await axios.get(`${backendUrl}/api/messages/conversations`);
            setConversations(updatedConvos.data.conversations);
            setSelectedConversationId(res.data.conversationId);
          } catch (error) {
             toast({ title: "Error", description: "Could not create conversation.", variant: "destructive" });
          }
        };
        createConv();
      }
    }
  }, [recipientIdFromUrl, conversations, user, toast, backendUrl]);

  // --- Auto-scroll to bottom ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Event Handlers ---
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversationId || !user) return;

    const messagePayload = {
      conversationId: selectedConversationId,
      text: messageInput,
    };
    
    setMessageInput("");

    try {
      const res = await axios.post(`${backendUrl}/api/messages/send`, messagePayload);
      const savedMessage = res.data;

      setMessages((prev) => [...prev, savedMessage]);
      socket.current?.emit("send_message", savedMessage);
    } catch (error) {
      toast({ title: "Error", description: "Message failed to send.", variant: "destructive" });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // --- Render Logic ---
  const selectedConv = conversations.find(c => c._id === selectedConversationId);
  const filteredConversations = conversations.filter(conv =>
    conv.partner.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getInitials = (name: string = "") => {
    const names = name.split(' ');
    if (names.length > 1 && names[1]) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="h-full w-full">
      <div className="grid lg:grid-cols-[350px_1fr] h-[calc(100vh-4rem)]">
        
        {/* MODIFIED: Added responsive classes to hide/show this panel on mobile */}
        <div className={`bg-background/80 border-r border-border flex-col ${selectedConversationId ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b lg:border-b-0">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search conversations..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
          </div>
          <div className="space-y-2 flex-1 overflow-y-auto p-4 pt-0">
            {isLoadingConvos ? <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin"/></div> :
            filteredConversations.map((c) => (
              <div key={c._id} onClick={() => setSelectedConversationId(c._id)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedConversationId === c._id ? 'bg-muted' : 'hover:bg-muted/50'}`}>
                <div className="relative">
                  <Avatar className="h-12 w-12"><AvatarImage src={c.partner.profilePic} /><AvatarFallback>{getInitials(c.partner.name)}</AvatarFallback></Avatar>
                  {c.partner.online && <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium truncate">{c.partner.name}</h4>
                    <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(c.updatedAt), { addSuffix: true })}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{c.lastMessage.text}</p>
                </div>
                {c.unreadCount && c.unreadCount > 0 && <Badge>{c.unreadCount}</Badge>}
              </div>
            ))}
          </div>
        </div>

        {/* MODIFIED: Added responsive classes to hide/show this panel on mobile */}
        <div className={`bg-muted/20 ${selectedConversationId ? 'flex' : 'hidden'} lg:flex`}>
          <Card className="bg-transparent border-none shadow-none rounded-none h-full flex flex-col w-full">
            {!selectedConv ? (
               <div className="hidden lg:flex flex-col items-center justify-center h-full text-center p-8">
                  <MessageSquare className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h2 className="text-xl font-medium">Select a conversation</h2>
                  <p className="text-muted-foreground">Choose from your existing conversations to start chatting.</p>
               </div>
            ) : (
              <>
                <div className="p-4 border-b border-border flex items-center justify-between bg-background/80">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSelectedConversationId(null)}>
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="relative">
                      <Avatar className="h-10 w-10"><AvatarImage src={selectedConv.partner.profilePic} /><AvatarFallback>{getInitials(selectedConv.partner.name)}</AvatarFallback></Avatar>
                      {selectedConv.partner.online && <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>}
                    </div>
                    <div>
                      <Link to={`/profile/${selectedConv.partner.id}`} className="font-medium hover:underline">{selectedConv.partner.name}</Link>
                      <p className="text-sm text-muted-foreground">{selectedConv.partner.online ? 'Online' : 'Offline'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon"><Phone className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon"><Video className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                  </div>
                </div>
                <CardContent className="flex-1 p-4 overflow-y-auto">
                  {isLoadingMessages ? <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin"/></div> :
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message._id} className={`flex items-end gap-2 ${message.senderId === user?._id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] flex flex-col ${message.senderId === user?._id ? 'items-end' : 'items-start'}`}>
                          <div className={`rounded-lg p-3 ${message.senderId === user?._id ? 'bg-primary text-primary-foreground' : 'bg-background border'}`}>
                            <p className="whitespace-pre-wrap">{message.text}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 px-1">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef}></div>
                  </div>}
                </CardContent>
                <div className="p-4 border-t border-border bg-background/80">
                  <div className="flex gap-2">
                    <Input value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Type your message..." className="flex-1" />
                    <Button onClick={handleSendMessage} className="bg-gradient-to-r from-primary to-accent"><Send className="h-4 w-4" /></Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messaging;