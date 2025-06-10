import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { UserGroupIcon, ChatBubbleLeftRightIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: 'transparent' }}>
      <div className="flex flex-col h-full" style={{ backgroundColor: 'transparent' }}>
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0" style={{ backgroundColor: 'transparent' }}>
          {/* Unassigned Conversations */}
          <div className="flex flex-col min-h-0" style={{ backgroundColor: 'transparent' }}>
            <div className="glass-effect rounded-2xl p-6 flex flex-col h-full" style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <div className="p-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mr-3 shadow-lg">
                    <UserGroupIcon className="h-6 w-6 text-white" />
                  </div>
                  Unassigned Conversations
                </h3>
                <div className="flex items-center space-x-3">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                    {unassignedConversations.length}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                    <span className="text-xs font-medium text-gray-600">
                      {isConnected ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
              
              {unassignedConversations.length === 0 ? (
                <div className="text-center text-gray-500 py-12 flex-1 flex flex-col justify-center">
                  <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <UserGroupIcon className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="font-bold text-gray-700 text-lg">No unassigned conversations</p>
                  <p className="text-sm text-gray-500 mt-2 font-medium">New conversations will appear here</p>
                </div>
              ) : (
                <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                  {unassignedConversations.map((conversation, index) => (
                    <div 
                      key={conversation.id} 
                      className="glass-effect rounded-xl p-4 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.8) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                      }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-gray-800 flex items-center text-lg">
                            <div className="w-2.5 h-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mr-3 animate-pulse"></div>
                            {conversation.candidateName}
                          </h4>
                          <p className="text-sm text-gray-600 mt-2 font-medium">
                            Started: {formatTime(conversation.createdAt)}
                          </p>
                        </div>
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                          {conversation.status}
                        </span>
                      </div>
                      <button
                        onClick={() => takeConversation(conversation.id)}
                        disabled={isLoading || !isConnected}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg disabled:transform-none"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Taking...
                          </div>
                        ) : (
                          'Take Conversation'
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Conversation */}
          <div className="flex flex-col min-h-0" style={{ backgroundColor: 'transparent' }}>
            <div className="glass-effect rounded-2xl p-6 flex flex-col h-full" style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <div className="p-2.5 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl mr-3 shadow-lg">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
                  </div>
                  Active Conversation
                </h3>
                {activeConversation && (
                  <span className="bg-gradient-to-r from-green-500 to-teal-600 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                    {adminName}
                  </span>
                )}
              </div>

              {!activeConversation ? (
                <div className="text-center text-gray-500 py-12 flex-1 flex flex-col justify-center">
                  <div className="p-4 bg-gradient-to-r from-green-100 to-teal-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <ChatBubbleLeftRightIcon className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="font-bold text-gray-700 text-lg">No active conversation</p>
                  <p className="text-sm text-gray-500 mt-2 font-medium">Take a conversation to start chatting</p>
                </div>
              ) : (
                <div className="glass-effect rounded-xl flex flex-col flex-1 min-h-0" style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(248, 250, 252, 0.7) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.4)'
                }}>
                  {/* Chat Header */}
                  <div className="p-5 rounded-t-xl flex justify-between items-center flex-shrink-0" style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}>
                    <div>
                      <h4 className="font-bold text-white text-lg tracking-tight">{activeConversation.candidateName}</h4>
                      <p className="text-sm text-white text-opacity-90 font-medium mt-1">Conversation #{activeConversation.id}</p>
                    </div>
                    <button
                      onClick={closeConversation}
                      className="bg-red-500 bg-opacity-90 hover:bg-opacity-100 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      Close Chat
                    </button>
                  </div>

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
                          <div
                            key={message.id}
                            className={`flex ${
                              message.senderId === adminId ? 'justify-end' : 'justify-start'
                            }`}
                            style={{
                              animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
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
                                  {formatTime(message.createdAt)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="p-4 rounded-b-xl flex-shrink-0" style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.3)'
                  }}>
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={isConnected ? "Type a message..." : "Connecting..."}
                        disabled={!isConnected}
                        className="flex-1 border-0 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 shadow-lg"
                        style={{ 
                          background: isConnected 
                            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)'
                            : 'rgba(243, 244, 246, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!isConnected || !newMessage.trim()}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white p-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:transform-none"
                      >
                        <PaperAirplaneIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChatPanel; 