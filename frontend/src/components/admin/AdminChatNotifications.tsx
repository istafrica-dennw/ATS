import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface Conversation {
  id: number;
  candidateId: number;
  candidateName: string;
  adminId?: number;
  adminName?: string;
  status: string;
  createdAt: string;
}

interface AdminChatNotificationsProps {
  adminId: number;
  adminName: string;
}

const AdminChatNotifications: React.FC<AdminChatNotificationsProps> = ({ adminId, adminName }) => {
  const navigate = useNavigate();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unassignedCount, setUnassignedCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:9092';
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('🎉 Admin notifications connected to Socket.IO server');
      setIsConnected(true);
      
      // Get initial unassigned conversations count
      loadUnassignedConversations(newSocket);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Admin notifications disconnected from Socket.IO server');
      setIsConnected(false);
    });

    // Listen for new unassigned conversations
    newSocket.on('new_unassigned_conversation', (conversationData: Conversation) => {
      console.log('🔔 New unassigned conversation notification:', conversationData);
      setUnassignedCount(prev => prev + 1);
      
      // Optional: Show browser notification if permission granted and API is available
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Support Request', {
          body: `${conversationData.candidateName} started a new conversation`,
          icon: '/favicon.ico'
        });
      }
    });

    // Listen for conversations being taken by other admins
    newSocket.on('conversation_taken', (data: { conversationId: number }) => {
      console.log('📝 Conversation taken by another admin:', data);
      setUnassignedCount(prev => Math.max(0, prev - 1));
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Admin notifications Socket.IO connection error:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Request notification permission only if the API is available
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      console.log('🧹 Cleaning up admin notifications socket connection');
      newSocket.removeAllListeners();
      newSocket.disconnect();
    };
  }, []);

  const loadUnassignedConversations = (socketInstance: Socket) => {
    socketInstance.emit('get_unassigned_conversations', {}, (response: any) => {
      if (response.success) {
        setUnassignedCount(response.conversations?.length || 0);
        console.log('📊 Unassigned conversations count:', response.conversations?.length || 0);
      } else {
        console.error('❌ Failed to load unassigned conversations count:', response.error);
      }
    });
  };

  const handleChatClick = () => {
    navigate('/admin/chat');
  };

  return (
    <div className="relative">
      <button
        onClick={handleChatClick}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-lg transition-colors"
        title="Chat Support Panel"
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6" />
        
        {/* Notification Badge */}
        {unassignedCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unassignedCount > 9 ? '9+' : unassignedCount}
          </span>
        )}
        
        {/* Connection Status Indicator */}
        <span className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
          isConnected ? 'bg-green-400' : 'bg-red-400'
        }`} />
      </button>
    </div>
  );
};

export default AdminChatNotifications; 