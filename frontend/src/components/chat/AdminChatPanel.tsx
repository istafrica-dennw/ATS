import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { UserGroupIcon, ChatBubbleLeftRightIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useDynamicTime } from '../../hooks/use-dynamic-time';

interface Message {
  id: number;
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
}

interface AdminChatPanelProps {
  adminId: number;
  adminName: string;
  onActiveConversationChange?: (hasActive: boolean) => void;
}

// Message component with dynamic timestamp
function MessageBubble({ message, adminId }: { message: Message; adminId: number }) {
  const dynamicTime = useDynamicTime(message.createdAt, true);
  
  return (
    <div
      className={`flex ${
        message.senderId === adminId ? 'justify-end' : 'justify-start'
      }`}
      style={{
        animation: `fadeInUp 0.3s ease-out both`
      }}
    >
      <div
        className={`max-w-xs px-4 py-3 rounded-2xl shadow-lg ${
          message.messageType === 'system'
            ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 text-center text-sm border border-yellow-200'
            : message.senderId === adminId
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300'
        }`}
      >
        {message.messageType !== 'system' && message.senderId !== adminId && (
          <div className="text-xs text-gray-600 mb-2 font-bold uppercase tracking-wide">
            {message.senderName} ({message.senderRole})
          </div>
        )}
        <div className="text-sm leading-relaxed font-medium">{message.content}</div>
        {message.messageType !== 'system' && (
          <div
            className={`text-xs mt-2 font-medium ${
              message.senderId === adminId ? 'text-blue-200' : 'text-gray-500'
            }`}
          >
            {dynamicTime}
          </div>
        )}
      </div>
    </div>
  );
}

// Conversation item component with dynamic timestamp
function ConversationItem({ conversation, onClick }: { conversation: Conversation; onClick: () => void }) {
  const dynamicTime = useDynamicTime(conversation.createdAt, true);
  
  return (
    <div
      className="p-4 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-r from-white to-gray-50 hover:from-blue-50 hover:to-indigo-50 border-l-4 border-l-red-400"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-gray-800 text-lg">{conversation.candidateName}</h4>
          <p className="text-sm text-gray-600 mt-1 font-medium">Click to assign to yourself</p>
        </div>
        <div className="text-xs text-gray-500 font-medium">
          {dynamicTime}
        </div>
      </div>
    </div>
  );
}

const AdminChatPanel: React.FC<AdminChatPanelProps> = ({ adminId, adminName, onActiveConversationChange }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unassignedConversations, setUnassignedConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Notify parent about active conversation status
  useEffect(() => {
    onActiveConversationChange?.(activeConversation !== null);
  }, [activeConversation, onActiveConversationChange]);

  // Initialize Socket.io connection
  useEffect(() => {
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:9092';
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('🎉 Admin connected to Socket.IO server');
      setIsConnected(true);
      
      // Get unassigned conversations
      loadUnassignedConversations(newSocket);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Admin disconnected from Socket.IO server');
      setIsConnected(false);
    });

    newSocket.on('new_message', (messageData: Message) => {
      console.log('📨 Admin received new message:', messageData);
      setMessages(prev => [...prev, messageData]);
    });

    newSocket.on('admin_assigned', (conversationData: Conversation) => {
      console.log('👨‍💼 Admin assignment confirmed:', conversationData);
      setActiveConversation(conversationData);
    });

    newSocket.on('conversation_closed', (data: any) => {
      console.log('🔒 Conversation closed:', data);
      setActiveConversation(null);
      setMessages([]);
      // Refresh unassigned conversations
      loadUnassignedConversations(newSocket);
    });

    // Listen for new unassigned conversations
    newSocket.on('new_unassigned_conversation', (conversationData: Conversation) => {
      console.log('🔔 AdminChatPanel: New unassigned conversation:', conversationData);
      setUnassignedConversations(prev => [...prev, conversationData]);
    });

    // Listen for conversations being taken by other admins
    newSocket.on('conversation_taken', (data: { conversationId: number }) => {
      console.log('📝 AdminChatPanel: Conversation taken by another admin:', data);
      setUnassignedConversations(prev => 
        prev.filter(conv => conv.id !== data.conversationId)
      );
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Admin Socket.IO connection error:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      console.log('🧹 Cleaning up admin socket connection');
      newSocket.removeAllListeners();
      newSocket.disconnect();
    };
  }, []);

  const loadUnassignedConversations = (socketInstance: Socket) => {
    socketInstance.emit('get_unassigned_conversations', {}, (response: any) => {
      if (response.success) {
        setUnassignedConversations(response.conversations || []);
        console.log('📋 Loaded unassigned conversations:', response.conversations);
      } else {
        console.error('❌ Failed to load unassigned conversations:', response.error);
      }
    });
  };

  const takeConversation = (conversationId: number) => {
    if (!socket || !isConnected) return;

    setIsLoading(true);
    
    // Optimistically remove from local list for immediate UI feedback
    setUnassignedConversations(prev => 
      prev.filter(conv => conv.id !== conversationId)
    );
    
    socket.emit('admin_take_conversation', { 
      adminId, 
      conversationId 
    }, (response: any) => {
      setIsLoading(false);
      if (response.success) {
        setActiveConversation(response.conversation);
        
        // Load message history for this conversation
        loadConversationMessages(conversationId);
        
        console.log('✅ Successfully took conversation:', response.conversation);
      } else {
        // If error, add the conversation back to the list
        console.error('❌ Failed to take conversation:', response.error);
        alert(response.error);
        
        // Refresh the list to restore accurate state
        loadUnassignedConversations(socket);
      }
    });
  };

  const loadConversationMessages = async (conversationId: number) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/chat/conversations/${conversationId}/messages`);
      if (response.ok) {
        const messagesData = await response.json();
        setMessages(messagesData);
      }
    } catch (error) {
      console.error('Failed to load conversation messages:', error);
    }
  };

  const sendMessage = () => {
    if (!socket || !newMessage.trim() || !isConnected || !activeConversation) return;

    // Check if conversation is still active
    if (activeConversation.status === 'CLOSED') {
      alert('Cannot send message: This conversation has been closed.');
      return;
    }

    console.log('📤 Admin sending message:', newMessage);
    socket.emit('send_message', { content: newMessage.trim() }, (response: any) => {
      if (response.success) {
        console.log('✅ Admin message sent successfully');
        setNewMessage('');
      } else {
        console.error('❌ Failed to send admin message:', response.error);
        // If the error is about closed conversation, refresh the conversation state
        if (response.error.includes('closed') || response.error.includes('CLOSED')) {
          setActiveConversation(null);
          setMessages([]);
          loadUnassignedConversations(socket);
        }
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const closeConversation = () => {
    if (!socket || !activeConversation) return;

    socket.emit('close_conversation', {}, (response: any) => {
      console.log('🔒 Admin closed conversation:', response);
      setActiveConversation(null);
      setMessages([]);
      // Refresh unassigned conversations
      loadUnassignedConversations(socket);
    });
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: 'transparent' }}>
      <div className="flex flex-col h-full" style={{ backgroundColor: 'transparent' }}>
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0" style={{ backgroundColor: 'transparent' }}>
          {/* Unassigned Conversations */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col min-h-0">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-pink-50 rounded-t-xl">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                Unassigned Conversations
                <span className="ml-auto bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                  {unassignedConversations.length}
                </span>
              </h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto min-h-0 custom-scrollbar">
              {unassignedConversations.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <UserGroupIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="font-bold text-gray-700 text-lg">No unassigned conversations</p>
                  <p className="text-sm text-gray-500 mt-2 font-medium">All conversations are being handled!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {unassignedConversations.map((conversation) => (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                      onClick={() => takeConversation(conversation.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Chat */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col min-h-0">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-xl">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                {activeConversation ? `Chat with ${activeConversation.candidateName}` : 'No Active Chat'}
                {activeConversation && (
                  <button
                    onClick={closeConversation}
                    className="ml-auto bg-red-100 hover:bg-red-200 text-red-800 text-xs font-medium px-3 py-1 rounded-full transition-colors"
                  >
                    Close Chat
                  </button>
                )}
              </h3>
            </div>
            
            {!activeConversation ? (
              <div className="flex-1 flex items-center justify-center text-gray-500 py-8">
                <div className="text-center">
                  <ChatBubbleLeftRightIcon className="h-20 w-20 mx-auto mb-4 text-gray-300" />
                  <p className="font-bold text-gray-700 text-xl">No active conversation</p>
                  <p className="text-sm text-gray-500 mt-2 font-medium">Assign a conversation to start chatting</p>
                </div>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto min-h-0 custom-scrollbar">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p className="font-bold text-gray-700 text-lg">No messages yet</p>
                      <p className="text-sm text-gray-500 mt-2 font-medium">Start the conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <MessageBubble key={message.id} message={message} adminId={adminId} />
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                      disabled={!socket}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || !socket}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-3 rounded-xl transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChatPanel; 