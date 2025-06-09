import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatBubbleLeftRightIcon, BellIcon } from '@heroicons/react/24/outline';
import AdminChatPanel from '../chat/AdminChatPanel';

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
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unassignedCount, setUnassignedCount] = useState(0);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [hasActiveConversations, setHasActiveConversations] = useState(false);

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
      
      // Optional: Show browser notification if permission granted
      if (Notification.permission === 'granted') {
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

    // Request notification permission
    if (Notification.permission === 'default') {
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

  const refreshCount = () => {
    if (socket && isConnected) {
      loadUnassignedConversations(socket);
    }
  };

  // Refresh count when modal is opened
  useEffect(() => {
    if (showChatPanel && socket && isConnected) {
      refreshCount();
    }
  }, [showChatPanel, socket, isConnected]);

  const handleCloseModal = () => {
    if (hasActiveConversations) {
      setShowCloseConfirmation(true);
    } else {
      setShowChatPanel(false);
    }
  };

  const confirmCloseModal = () => {
    // Close all active conversations
    if (socket && isConnected) {
      socket.emit('close_all_admin_conversations', { adminId }, (response: any) => {
        console.log('🔒 All admin conversations closed:', response);
      });
    }
    
    setShowCloseConfirmation(false);
    setShowChatPanel(false);
    setHasActiveConversations(false);
  };

  const cancelCloseModal = () => {
    setShowCloseConfirmation(false);
  };

  return (
    <>
      {/* Chat Icon with Notification Badge */}
      <div className="relative">
        <button
          onClick={() => setShowChatPanel(true)}
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

      {/* Full Screen Chat Panel Modal */}
      {showChatPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Support Chat Management</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={refreshCount}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded"
                  title="Refresh"
                >
                  <BellIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* Chat Panel Content */}
            <div className="flex-1 overflow-hidden">
              <AdminChatPanel 
                adminId={adminId} 
                adminName={adminName} 
                onActiveConversationChange={setHasActiveConversations}
              />
            </div>
          </div>
        </div>
      )}

      {/* Close Confirmation Modal */}
      {showCloseConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Close Chat Panel</h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                You have active conversations. Closing the chat panel will terminate all open conversations 
                and notify candidates that support has ended. Are you sure you want to continue?
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmCloseModal}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Close All Conversations
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminChatNotifications; 