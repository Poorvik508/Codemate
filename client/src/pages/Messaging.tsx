import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { io, Socket } from "socket.io-client";
import { backendUrl } from "@/config/backendUrl";

// --- UI Components & Utils ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Search, Phone, Video, MoreVertical, Loader2, MessageSquare, ArrowLeft, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

// --- Interfaces to match backend data ---
interface Partner { id: string; name: string; profilePic?: string; online: boolean; }
interface Conversation { _id: string; partner: Partner; lastMessage: { text: string; senderId: string; }; updatedAt: string; unreadCount?: number; }
interface Message { _id: string; conversationId: string; senderId: string; text: string; createdAt: string; }

const Messaging = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { userId: recipientIdFromUrl } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const socket = useRef<Socket | null>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingConvos, setIsLoadingConvos] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Effect for Socket Connection
  useEffect(() => {
    if (!user) return;
    socket.current = io(backendUrl || "http://localhost:4000", { withCredentials: true });

    socket.current.on("receive_message", (newMessage: Message) => {
      if (newMessage.senderId !== user?._id) {
        setConversations(prevConvos => 
          prevConvos.map(c => 
            c._id === newMessage.conversationId 
            ? { ...c, lastMessage: { text: newMessage.text, senderId: newMessage.senderId }, updatedAt: newMessage.createdAt } 
            : c
          ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        );
        if (newMessage.conversationId === selectedConversationId) {
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
      }
    });

    return () => {
      socket.current?.disconnect();
      socket.current?.off("receive_message");
    };
  }, [user, backendUrl, selectedConversationId]);

  // Effect to fetch initial conversations
  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      setIsLoadingConvos(true);
      try {
        const res = await axios.get(`${backendUrl}/api/messages/conversations`);
        setConversations(res.data.conversations);
      } catch (error) {
        toast({ title: "Error", description: "Could not load conversations.", variant: "destructive" });
      } finally {
        setIsLoadingConvos(false);
      }
    };
    fetchConversations();
  }, [user]);
  
  // Effect to handle URL changes and select the correct conversation
  useEffect(() => {
    if (recipientIdFromUrl && user && !isLoadingConvos) {
      if (recipientIdFromUrl === user._id) {
        navigate('/messaging');
        return;
      }
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
    } else if (!recipientIdFromUrl) {
      setSelectedConversationId(null);
    }
  }, [recipientIdFromUrl, conversations, user, isLoadingConvos, navigate]);

  // Effect to fetch messages and join socket room when a conversation is selected
  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    };
    socket.current?.emit("join_conversation", selectedConversationId);
    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const res = await axios.get(`${backendUrl}/api/messages/conversations/${selectedConversationId}/messages`);
        setMessages(res.data);
      } catch (error) {
        toast({ title: "Error", description: "Could not load messages.", variant: "destructive" });
      } finally {
        setIsLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [selectedConversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversationId || !user) return;
    const messagePayload = { conversationId: selectedConversationId, text: messageInput };
    setMessageInput("");
    try {
      const res = await axios.post(`${backendUrl}/api/messages/send`, messagePayload);
      const savedMessage = res.data;
      setMessages((prev) => [...prev, savedMessage]);
      socket.current?.emit("send_message", savedMessage);
      setConversations(prevConvos => {
        const updatedConv = prevConvos.find(c => c._id === selectedConversationId);
        if (updatedConv) {
          updatedConv.lastMessage = { text: savedMessage.text, senderId: savedMessage.senderId };
          updatedConv.updatedAt = savedMessage.createdAt;
          return [updatedConv, ...prevConvos.filter(c => c._id !== selectedConversationId)];
        }
        return prevConvos;
      });
    } catch (error) {
      toast({ title: "Error", description: "Message failed to send.", variant: "destructive" });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const selectedConv = conversations.find(c => c._id === selectedConversationId);
  const filteredConversations = conversations.filter(conv => conv.partner.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const getInitials = (name: string = "") => {
    const names = name.split(' ');
    if (names.length > 1 && names[1]) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div>
      {/* Conversation List Panel (Absolutely Positioned) */}
      <div className={`
        absolute top-16 bottom-0 left-0 w-full lg:w-[350px]
        bg-background/80 border-r border-border
        grid grid-rows-[auto_1fr] overflow-hidden
        ${selectedConversationId ? 'hidden lg:grid' : 'grid'}
      `}>
        {/* Row 1: Search Header */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search conversations..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </div>
        {/* Row 2: Scrollable List */}
        <div className="overflow-y-auto p-2 space-y-1">
          {isLoadingConvos ? <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin"/></div> :
          filteredConversations.length > 0 ? (
            filteredConversations.map((c) => (
              <div key={c._id} onClick={() => navigate(`/messaging/${c.partner.id}`)}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedConversationId === c._id ? 'bg-muted' : 'hover:bg-muted/50'}`}>
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
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
              <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
              <h3 className="font-semibold text-lg">No conversations yet</h3>
              <p className="text-sm">Find a partner on the Discover page to start chatting!</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Window Panel (Absolutely Positioned) */}
      <div className={`
        absolute top-16 bottom-0 right-0 left-0 lg:left-[350px]
        bg-muted/20 
        ${selectedConversationId ? 'flex' : 'hidden'} lg:flex flex-col
      `}>
        {!selectedConv ? (
           <div className="flex flex-col items-center justify-center h-full text-center p-8 w-full">
              <MessageSquare className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-medium">Select a conversation</h2>
              <p className="text-muted-foreground mb-6">Choose from your existing conversations or find a new partner.</p>
              <Link to="/matches"><Button><Users className="h-4 w-4 mr-2" />Discover Partners</Button></Link>
           </div>
        ) : (
          <div className="h-full w-full grid grid-rows-[auto_1fr_auto] bg-transparent">
            {/* Row 1: Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-background/80">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => navigate('/messaging')}>
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

            {/* Row 2: Scrollable Message Area */}
            <div className="overflow-y-auto p-4">
              <div className="space-y-4">
                {isLoadingMessages ? <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin"/></div> :
                messages.map((message) => (
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
              </div>
            </div>
            
            {/* Row 3: Input Footer */}
            <div className="p-4 border-t border-border bg-background/80">
              <div className="flex gap-2">
                <Input value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Type your message..." className="flex-1" />
                <Button onClick={handleSendMessage} className="bg-gradient-to-r from-primary to-accent"><Send className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messaging;