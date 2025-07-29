import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ConversationCard } from '../../components/ConversationCard';
import { ChatModal } from '../../components/ChatModal';
import { ChatBubbleLeftRightIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../hooks/use-toast';
import { io, Socket } from 'socket.io-client';

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
  priority?: "high" | "medium" | "low";
  unreadCount?: number;
}

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  content: string;
  createdAt: string;
  messageType: string;
  conversationId: number;
}

interface ActiveChatModal {
  conversation: Conversation;
  isMinimized: boolean;
}

const AdminChatPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeConversations, setActiveConversations] = useState<Conversation[]>([]);
  const [unassignedConversations, setUnassignedConversations] = useState<Conversation[]>([]);
  const [chatModals, setChatModals] = useState<ActiveChatModal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Socket.io connection
  useEffect(() => {
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:9092';
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('🎉 AdminChatPage connected to Socket.IO server');
      setIsConnected(true);
      
      // Load initial data
      loadUnassignedConversations(newSocket);
      loadActiveConversations(newSocket);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 AdminChatPage disconnected from Socket.IO server');
      setIsConnected(false);
    });

    // Listen for new unassigned conversations
    newSocket.on('new_unassigned_conversation', (conversationData: Conversation) => {
      console.log('🔔 New unassigned conversation:', conversationData);
      setUnassignedConversations(prev => [...prev, conversationData]);
    });

    // Listen for conversations being taken by other admins
    newSocket.on('conversation_taken', (data: { conversationId: number }) => {
      console.log('📝 Conversation taken by another admin:', data);
      setUnassignedConversations(prev => 
        prev.filter(conv => conv.id !== data.conversationId)
      );
    });

    // Listen for new messages to update last message
    newSocket.on('new_message', (messageData: Message) => {
      console.log('📨 New message received:', messageData);
      
      // Update the last message for both active and unassigned conversations
      // We need to match by conversation ID from the message data
      setActiveConversations(prev => 
        prev.map(conv => {
          if (conv.id === messageData.conversationId) {
            return {
              ...conv,
              lastMessage: messageData.content,
              timestamp: 'Just now'
            };
          }
          return conv;
        })
      );

      // Also update unassigned conversations
      setUnassignedConversations(prev => 
        prev.map(conv => {
          if (conv.id === messageData.conversationId) {
            return {
              ...conv,
              lastMessage: messageData.content,
              timestamp: 'Just now'
            };
          }
          return conv;
        })
      );
    });

    newSocket.on('admin_assigned', (conversationData: Conversation) => {
      console.log('👨‍💼 Admin assignment confirmed:', conversationData);
      // Move from unassigned to active only if not already in active
      setUnassignedConversations(prev => 
        prev.filter(conv => conv.id !== conversationData.id)
      );
      setActiveConversations(prev => {
        const exists = prev.some(conv => conv.id === conversationData.id);
        if (!exists) {
          return [...prev, conversationData];
        }
        return prev;
      });
    });

    newSocket.on('conversation_closed', (data: any) => {
      console.log('🔒 Conversation closed:', data);
      setActiveConversations(prev => 
        prev.filter(conv => conv.id !== data.conversationId)
      );
      // Close any open chat modals for this conversation
      setChatModals(prev => 
        prev.filter(modal => modal.conversation.id !== data.conversationId)
      );
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      console.log('🧹 Cleaning up socket connection');
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

  const loadActiveConversations = (socketInstance: Socket) => {
    // Load conversations assigned to this admin
    socketInstance.emit('get_admin_conversations', { adminId: user?.id }, (response: any) => {
      if (response.success) {
        setActiveConversations(response.conversations || []);
        console.log('📋 Loaded active conversations:', response.conversations);
      } else {
        console.error('❌ Failed to load active conversations:', response.error);
      }
    });
  };

  const handleAssignConversation = (conversationId: number) => {
    if (!socket || !isConnected || !user) return;

    const conversationToAssign = unassignedConversations.find(conv => conv.id === conversationId);
    if (!conversationToAssign) return;

    setIsLoading(true);
    
    // Optimistically remove from unassigned list
    setUnassignedConversations(prev => prev.filter(conv => conv.id !== conversationId));
    
    socket.emit('admin_take_conversation', { 
      adminId: user.id, 
      conversationId 
    }, (response: any) => {
      setIsLoading(false);
      if (response.success) {
        // Only add to active conversations if it's not already there
        setActiveConversations(prev => {
          const exists = prev.some(conv => conv.id === conversationId);
          if (!exists) {
            return [...prev, response.conversation];
          }
          return prev;
        });
        
        toast({
          title: "Conversation Assigned",
          description: `${conversationToAssign.candidateName}'s conversation has been assigned to you.`,
        });
      } else {
        // If error, add the conversation back to the unassigned list
        console.error('❌ Failed to take conversation:', response.error);
        setUnassignedConversations(prev => [...prev, conversationToAssign]);
        toast({
          title: "Error",
          description: response.error,
          variant: "error"
        });
      }
    });
  };

  const handleReply = (conversation: Conversation) => {
    // Check if this conversation is already open in a modal
    const existingModal = chatModals.find(modal => modal.conversation.id === conversation.id);
    
    if (existingModal) {
      // If minimized, maximize it
      if (existingModal.isMinimized) {
        setChatModals(prev => 
          prev.map(modal => 
            modal.conversation.id === conversation.id 
              ? { ...modal, isMinimized: false }
              : modal
          )
        );
      }
    } else {
      // Open new chat modal
      setChatModals(prev => [...prev, { conversation, isMinimized: false }]);
    }
  };

  const handleCloseChatModal = (conversationId: number) => {
    // Remove the conversation from active conversations and close modal
    setActiveConversations(prev => prev.filter(conv => conv.id !== conversationId));
    setChatModals(prev => prev.filter(modal => modal.conversation.id !== conversationId));
  };

  const handleMinimizeChatModal = (conversationId: number) => {
    // Remove the chat modal completely when minimized
    setChatModals(prev => prev.filter(modal => modal.conversation.id !== conversationId));
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            Support Chat Management
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Active Conversations Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 transform hover:scale-[1.02] transition-transform">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 dark:from-green-900/20 to-emerald-50 dark:to-emerald-900/20 rounded-t-lg">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
                Active Conversations
                <span className="ml-auto bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-sm font-medium px-2.5 py-0.5 rounded-full">
                  {activeConversations.length}
                </span>
              </h2>
            </div>
            <div className="p-6">
              {activeConversations.length > 0 ? (
                <div className="space-y-4">
                  {activeConversations.map((conversation) => (
                    <ConversationCard 
                      key={conversation.id} 
                      conversation={conversation} 
                      type="active"
                      onReply={handleReply}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No active conversations</p>
                </div>
              )}
            </div>
          </div>

          {/* Unassigned Conversations Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 transform hover:scale-[1.02] transition-transform">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-50 dark:from-orange-900/20 to-amber-50 dark:to-amber-900/20 rounded-t-lg">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                Unassigned Conversations
                <span className="ml-auto bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 text-sm font-medium px-2.5 py-0.5 rounded-full">
                  {unassignedConversations.length}
                </span>
              </h2>
            </div>
            <div className="p-6">
              {unassignedConversations.length > 0 ? (
                <div className="space-y-4">
                  {unassignedConversations.map((conversation) => (
                    <ConversationCard 
                      key={conversation.id} 
                      conversation={conversation} 
                      type="unassigned"
                      onAssign={handleAssignConversation}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <UserIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No unassigned conversations</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Chat Modals */}
      {chatModals.map((modal) => (
        <ChatModal
          key={modal.conversation.id}
          isOpen={true}
          onClose={handleCloseChatModal}
          onMinimize={handleMinimizeChatModal}
          conversation={modal.conversation}
          isMinimized={modal.isMinimized}
          adminId={user.id}
          adminName={`${user.firstName} ${user.lastName}`}
        />
      ))}
    </div>
  );
};

export default AdminChatPage; 