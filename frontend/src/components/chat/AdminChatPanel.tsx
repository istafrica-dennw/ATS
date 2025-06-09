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
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="bg-blue-600 text-white p-4 rounded-t-lg">
          <h2 className="text-xl font-semibold">Admin Chat Panel</h2>
          <p className="text-sm opacity-90">
            {adminName} • {isConnected ? 'Connected' : 'Disconnected'}
            <span className={`ml-2 inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
          </p>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Unassigned Conversations */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <UserGroupIcon className="h-5 w-5 mr-2" />
              Unassigned Conversations ({unassignedConversations.length})
            </h3>
            
            {unassignedConversations.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <UserGroupIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No unassigned conversations</p>
                <p className="text-sm">New conversations will appear here</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {unassignedConversations.map((conversation) => (
                  <div key={conversation.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{conversation.candidateName}</h4>
                        <p className="text-sm text-gray-500">
                          Started: {formatTime(conversation.createdAt)}
                        </p>
                      </div>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                        {conversation.status}
                      </span>
                    </div>
                    <button
                      onClick={() => takeConversation(conversation.id)}
                      disabled={isLoading || !isConnected}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                    >
                      {isLoading ? 'Taking...' : 'Take Conversation'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Conversation */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
              Active Conversation
            </h3>

            {!activeConversation ? (
              <div className="text-center text-gray-500 py-8">
                <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No active conversation</p>
                <p className="text-sm">Take a conversation to start chatting</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg flex flex-col h-96">
                {/* Chat Header */}
                <div className="bg-gray-50 p-3 rounded-t-lg border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{activeConversation.candidateName}</h4>
                    <p className="text-sm text-gray-500">Conversation #{activeConversation.id}</p>
                  </div>
                  <button
                    onClick={closeConversation}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Close Chat
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500">
                      <p>No messages yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderId === adminId ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs px-3 py-2 rounded-lg ${
                              message.messageType === 'system'
                                ? 'bg-yellow-100 text-yellow-800 text-center text-xs'
                                : message.senderId === adminId
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            {message.messageType !== 'system' && message.senderId !== adminId && (
                              <div className="text-xs text-gray-500 mb-1">
                                {message.senderName} ({message.senderRole})
                              </div>
                            )}
                            <div className="text-sm">{message.content}</div>
                            {message.messageType !== 'system' && (
                              <div
                                className={`text-xs mt-1 ${
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
                <div className="p-3 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={isConnected ? "Type a message..." : "Connecting..."}
                      disabled={!isConnected}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!isConnected || !newMessage.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg transition-colors"
                    >
                      <PaperAirplaneIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChatPanel; 