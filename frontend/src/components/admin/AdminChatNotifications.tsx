import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
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
      {showChatPanel && ReactDOM.createPortal(
        <div 
          className="chat-modal-override"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.8) 100%)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <div 
            className="chat-modal-content glass-effect"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              position: 'relative',
              zIndex: 1000000,
              maxWidth: '95vw',
              width: '100%',
              height: '95vh',
              maxHeight: '95vh',
              minHeight: '600px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'slideInFromBottom 0.4s ease-out'
            }}
          >
            {/* Modal Header */}
            <div 
              className="flex justify-between items-center p-8 flex-shrink-0 relative overflow-hidden"
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '20px 20px 0 0',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)'
              }}
            >
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-10 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white bg-opacity-5 rounded-full translate-y-16 -translate-x-16"></div>
              
              <div className="flex items-center space-x-0" style={{borderRadius: '20px'}}>
                <div className="relative">
                  <div className="absolute inset-0 bg-white bg-opacity-30 rounded-2xl blur-sm"></div>
                  <div className="relative p-4 bg-gradient-to-br from-white from-20% to-transparent to-80% bg-opacity-25 rounded-2xl border border-white border-opacity-30">
                    <ChatBubbleLeftRightIcon className="h-8 w-8 text-white drop-shadow-lg" />
                  </div>
                </div>
                <div className="ml-6" style={{paddingRight: '20px'}}>
                  <div className="relative" >
                    <h2 className="text-3xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
                      Support Chat Management
                    </h2>
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-white from-0% to-transparent to-50% opacity-60"></div>
                  </div>
                  <p className="text-base text-white text-opacity-95 font-semibold mt-3 tracking-wide drop-shadow-md">
                    Real-time customer support dashboard
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 relative z-10">
                <button
                  onClick={refreshCount}
                  className="group p-4 text-white text-opacity-90 hover:text-white rounded-2xl transition-all duration-300 transform hover:scale-110 relative overflow-hidden"
                  title="Refresh conversations"
                >
                  <div className="absolute inset-0 bg-white bg-opacity-0 group-hover:bg-opacity-20 rounded-2xl transition-all duration-300"></div>
                  <BellIcon className="h-6 w-6 relative z-10 drop-shadow-lg" />
                </button>
                <button
                  onClick={handleCloseModal}
                  className="group p-4 text-white text-opacity-90 hover:text-white rounded-2xl transition-all duration-300 transform hover:scale-110 relative overflow-hidden"
                  title="Close chat panel"
                >
                  <div className="absolute inset-0 bg-red-500 bg-opacity-0 group-hover:bg-opacity-30 rounded-2xl transition-all duration-300"></div>
                  <svg className="h-6 w-6 relative z-10 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Chat Panel Content */}
            <div 
              className="flex-1 overflow-hidden"
              style={{ 
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)'
              }}
            >
              <AdminChatPanel 
                adminId={adminId} 
                adminName={adminName} 
                onActiveConversationChange={setHasActiveConversations}
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Close Confirmation Modal */}
      {showCloseConfirmation && ReactDOM.createPortal(
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000001,
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.9) 100%)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <div 
            className="glass-effect rounded-xl shadow-2xl max-w-md w-full mx-4 p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              zIndex: 1000002,
              animation: 'slideInFromBottom 0.4s ease-out'
            }}
          >
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 p-2 bg-red-100 rounded-full">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-bold text-gray-900">Close Chat Panel</h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 leading-relaxed">
                You have active conversations. Closing the chat panel will terminate all open conversations 
                and notify candidates that support has ended. Are you sure you want to continue?
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white bg-opacity-80 border border-gray-300 rounded-lg hover:bg-opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={confirmCloseModal}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 border border-transparent rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Close All Conversations
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default AdminChatNotifications; 