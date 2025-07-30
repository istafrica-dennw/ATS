import React, { useState, useEffect, useRef } from 'react';
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { PaperAirplaneIcon, XMarkIcon, MinusIcon } from "@heroicons/react/24/outline";
import { useToast } from "../hooks/use-toast";
import { useDynamicTime } from "../hooks/use-dynamic-time";
import { io, Socket } from 'socket.io-client';
import axiosInstance from '../utils/axios';

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  content: string;
  createdAt: string;
  messageType: string;
}

interface Conversation {
  id: number;
  candidateId: number;
  candidateName: string;
  adminId?: number;
  adminName?: string;
  status: string;
  createdAt: string;
  lastMessage?: string;
  timestamp?: string;
  avatar?: string;
  unreadCount?: number;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: (conversationId: number) => void;
  onMinimize: (conversationId: number) => void;
  conversation: Conversation | null;
  isMinimized: boolean;
  adminId: number;
  adminName: string;
}

// Message component with dynamic timestamp
function MessageBubble({ message, adminId }: { message: Message; adminId: number }) {
  const dynamicTime = useDynamicTime(message.createdAt, true);
  
  return (
    <div
      className={`flex ${message.senderId === adminId ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          message.messageType === 'system'
            ? 'bg-yellow-100 text-yellow-800 text-center text-sm border border-yellow-200'
            : message.senderId === adminId
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        {message.messageType !== 'system' && message.senderId !== adminId && (
          <div className="text-xs text-gray-600 mb-2 font-medium">
            {message.senderName} ({message.senderRole})
          </div>
        )}
        <p className="text-sm">{message.content}</p>
        {message.messageType !== 'system' && (
          <p
            className={`text-xs mt-1 ${
              message.senderId === adminId ? "text-blue-100" : "text-gray-500"
            }`}
          >
            {dynamicTime}
          </p>
        )}
      </div>
    </div>
  );
}

export function ChatModal({ 
  isOpen, 
  onClose, 
  onMinimize, 
  conversation, 
  isMinimized, 
  adminId, 
  adminName 
}: ChatModalProps) {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages immediately when modal opens
  useEffect(() => {
    if (isOpen && conversation) {
      console.log('🔄 ChatModal opened - Loading messages for conversation:', conversation.id);
      // Try axios version first, fallback to fetch if needed
      loadConversationMessagesWithAxios(conversation.id);
    }
  }, [isOpen, conversation?.id]);

  // Initialize Socket.io connection
  useEffect(() => {
    if (!isOpen || !conversation) return;

    console.log('🔌 Initializing socket connection for conversation:', conversation.id);
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:9092';
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('🎉 ChatModal connected to Socket.IO server');
      setIsConnected(true);
      
      // First, take the conversation if it's unassigned
      if (!conversation.adminId) {
        console.log('📝 Taking unassigned conversation:', conversation.id);
        newSocket.emit('admin_take_conversation', { 
          adminId: adminId, 
          conversationId: conversation.id 
        }, (response: any) => {
          if (response.success) {
            console.log('✅ Successfully took conversation:', response.conversation);
            // Reload messages after taking the conversation
            loadConversationMessagesWithAxios(conversation.id);
          } else {
            console.error('❌ Failed to take conversation:', response.error);
            toast({
              title: "Error",
              description: "Failed to take conversation: " + response.error,
              variant: "error"
            });
          }
        });
      } else {
        // If already assigned, join the room for monitoring/messaging
        console.log('🏠 Joining room for assigned conversation:', conversation.id);
        newSocket.emit('join_admin_room', { 
          adminId: adminId, 
          conversationId: conversation.id 
        }, (response: any) => {
          if (response.success) {
            console.log('✅ Successfully joined conversation room');
            // Reload messages after joining the room
            loadConversationMessagesWithAxios(conversation.id);
          } else {
            console.error('❌ Failed to join conversation room:', response.error);
            toast({
              title: "Error",
              description: "Failed to join conversation room: " + response.error,
              variant: "error"
            });
          }
        });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 ChatModal disconnected from Socket.IO server');
      setIsConnected(false);
    });

    newSocket.on('new_message', (messageData: Message) => {
      console.log('📨 ChatModal received new message:', messageData);
      // Only add message if it belongs to this conversation
      if (messageData.conversationId === conversation.id) {
        setMessages(prev => [...prev, messageData]);
      }
    });

    newSocket.on('admin_assigned', (conversationData: any) => {
      console.log('👨‍💼 Admin assignment confirmed in ChatModal:', conversationData);
      // Load messages after assignment is confirmed
      if (conversationData.id === conversation.id) {
        loadConversationMessagesWithAxios(conversation.id);
      }
    });

    newSocket.on('conversation_closed', (data: any) => {
      console.log('🔒 Conversation closed:', data);
      if (conversation && data.conversationId === conversation.id) {
        onClose(conversation.id);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ ChatModal Socket.IO connection error:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      console.log('🧹 Cleaning up ChatModal socket connection');
      newSocket.removeAllListeners();
      newSocket.disconnect();
    };
  }, [isOpen, conversation, adminId]);

  const loadConversationMessagesWithAxios = async (conversationId: number) => {
    console.log('🔄 [AXIOS] Loading messages for conversation:', conversationId);
    setIsLoading(true);
    
    try {
      const response = await axiosInstance.get(`/chat/conversations/${conversationId}/messages`);
      console.log('📨 [AXIOS] Loaded messages:', response.data.length, 'messages');
      console.log('📨 [AXIOS] Messages data:', response.data);
      setMessages(response.data);
    } catch (error: any) {
      console.error('❌ [AXIOS] Error loading conversation messages:', error);
      
      if (error.response?.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to access messages",
          variant: "error"
        });
      } else if (error.response?.status === 404) {
        toast({
          title: "Not Found", 
          description: "Conversation not found or no messages available",
          variant: "error"
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to load conversation messages: ${error.response?.status || 'Unknown error'}`,
          variant: "error"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversationMessages = async (conversationId: number) => {
    console.log('🔄 Loading messages for conversation:', conversationId);
    console.log('🔄 Conversation object:', conversation);
    setIsLoading(true);
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const url = `${apiUrl}/api/chat/conversations/${conversationId}/messages`;
      console.log('📡 Fetching messages from:', url);
      
      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      console.log('🔐 Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'null');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        console.log('🔐 Added Authorization header to request');
      } else {
        console.warn('⚠️ No JWT token found in localStorage');
      }
      
      console.log('📡 Request headers:', headers);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });
      console.log('📡 Response status:', response.status, response.statusText);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const messagesData = await response.json();
        console.log('📨 Loaded messages:', messagesData.length, 'messages');
        console.log('📨 Messages data:', messagesData);
        setMessages(messagesData);
      } else {
        console.error('❌ Failed to fetch messages:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Error response body:', errorText);
        
        if (response.status === 401) {
          toast({
            title: "Authentication Error",
            description: "Please log in again to access messages",
            variant: "error"
          });
        } else if (response.status === 404) {
          toast({
            title: "Not Found",
            description: "Conversation not found or no messages available",
            variant: "error"
          });
        } else {
          toast({
            title: "Error",
            description: `Failed to load conversation messages: ${response.status} ${response.statusText}`,
            variant: "error"
          });
        }
      }
    } catch (error) {
      console.error('❌ Error loading conversation messages:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation messages: " + (error instanceof Error ? error.message : 'Unknown error'),
        variant: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !conversation || !socket || !isConnected) return;

    console.log('📤 Sending message:', newMessage);
    socket.emit('send_message', { content: newMessage.trim() }, (response: any) => {
      if (response.success) {
        console.log('✅ Message sent successfully');
        setNewMessage('');
        toast({
          title: "Message Sent",
          description: `Reply sent to ${conversation.candidateName}`,
        });
      } else {
        console.error('❌ Failed to send message:', response.error);
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "error"
        });
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    if (!conversation || !socket) return;

    socket.emit('close_conversation', {}, (response: any) => {
      console.log('🔒 Closing conversation:', response);
      onClose(conversation.id);
      toast({
        title: "Conversation Closed",
        description: `${conversation.candidateName}'s conversation has been closed.`,
      });
    });
  };

  const handleMinimize = () => {
    if (conversation) {
      onMinimize(conversation.id);
    }
  };

  // Generate avatar initials from candidate name
  const getAvatarInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!conversation || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className={`bg-white rounded-lg shadow-xl transition-all flex flex-col ${
        isMinimized ? 'h-16 w-80' : 'h-[600px] w-full max-w-2xl'
      }`}>
        {/* Header */}
        <div className="p-6 pb-4 border-b bg-gray-50 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {conversation.avatar || getAvatarInitials(conversation.candidateName)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {conversation.candidateName}
                </h3>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleMinimize}>
                <MinusIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} adminId={adminId} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-6 pt-4 border-t bg-gray-50">
              <div className="flex gap-3">
                <Textarea
                  placeholder="Type your reply..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 min-h-[80px] resize-none"
                  disabled={!isConnected}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || !isConnected}
                  className="px-4"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 