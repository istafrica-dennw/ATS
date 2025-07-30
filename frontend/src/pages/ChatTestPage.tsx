import React, { useState } from 'react';
import ChatWidget from '../components/chat/ChatWidget';
import AdminChatPanel from '../components/chat/AdminChatPanel';

const ChatTestPage: React.FC = () => {
  const [userRole, setUserRole] = useState<'CANDIDATE' | 'ADMIN'>('CANDIDATE');
  const [userId, setUserId] = useState(1);
  const [userName, setUserName] = useState('Test User');

  // Mock user data for testing
  const candidateUser = {
    id: 2,
    name: 'Niwemugisha Denis',
    role: 'CANDIDATE' as const
  };

  const adminUser = {
    id: 1,
    name: 'System Administrator',
    role: 'ADMIN' as const
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Chat System Test</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Test the Socket.io chat functionality between candidates and admins
              </p>
            </div>
            
            {/* User Role Switcher */}
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => {
                    setUserRole('CANDIDATE');
                    setUserId(candidateUser.id);
                    setUserName(candidateUser.name);
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    userRole === 'CANDIDATE'
                      ? 'bg-white dark:bg-gray-600 text-blue-700 dark:text-blue-300 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Test as Candidate
                </button>
                <button
                  onClick={() => {
                    setUserRole('ADMIN');
                    setUserId(adminUser.id);
                    setUserName(adminUser.name);
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    userRole === 'ADMIN'
                      ? 'bg-white dark:bg-gray-600 text-blue-700 dark:text-blue-300 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Test as Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">🧪 Testing Instructions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">As Candidate:</h3>
              <ol className="list-decimal list-inside space-y-1 text-blue-700 dark:text-blue-300">
                <li>Click the chat button (bottom right)</li>
                <li>Send your first message</li>
                <li>A conversation will be created automatically</li>
                <li>Wait for an admin to join</li>
                <li>Chat in real-time!</li>
              </ol>
            </div>
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">As Admin:</h3>
              <ol className="list-decimal list-inside space-y-1 text-blue-700 dark:text-blue-300">
                <li>View unassigned conversations</li>
                <li>Click "Take Conversation" to join</li>
                <li>Chat with the candidate</li>
                <li>Close conversation when done</li>
                <li>No other admin can take assigned chats</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Current User Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Current Test User</h2>
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
              userRole === 'CANDIDATE' ? 'bg-green-500 dark:bg-green-600' : 'bg-blue-500 dark:bg-blue-600'
            }`}>
              {userName.charAt(0)}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{userName}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Role: {userRole}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">User ID: {userId}</p>
            </div>
          </div>
        </div>

        {/* Backend Connection Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Backend Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Spring Boot API</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">http://localhost:8080</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Socket.IO Server</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">http://localhost:9092</span>
            </div>
          </div>
        </div>

        {/* Test Area */}
        {userRole === 'ADMIN' ? (
          <AdminChatPanel adminId={userId} adminName={userName} />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Candidate Test Area</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              As a candidate, you'll see the chat widget in the bottom right corner. 
              Click it to start a conversation with support.
            </p>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">🔧 Backend Services</h4>
              <div className="space-y-1 text-sm">
                <div className="text-gray-700 dark:text-gray-300">REST API: <span className="text-sm text-gray-600 dark:text-gray-400">{process.env.REACT_APP_API_URL || 'http://localhost:8080'}</span></div>
                <div className="text-gray-700 dark:text-gray-300">Socket.io: <span className="text-sm text-gray-600 dark:text-gray-400">{process.env.REACT_APP_SOCKET_URL || 'http://localhost:9092'}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Widget - Only shown for candidates */}
      {userRole === 'CANDIDATE' && (
        <ChatWidget userId={userId} userName={userName} userRole={userRole} />
      )}
    </div>
  );
};

export default ChatTestPage; 