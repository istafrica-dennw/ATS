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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chat System Test</h1>
              <p className="text-sm text-gray-600 mt-1">
                Test the Socket.io chat functionality between candidates and admins
              </p>
            </div>
            
            {/* User Role Switcher */}
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => {
                    setUserRole('CANDIDATE');
                    setUserId(candidateUser.id);
                    setUserName(candidateUser.name);
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    userRole === 'CANDIDATE'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
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
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">🧪 Testing Instructions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-medium text-blue-800 mb-2">As Candidate:</h3>
              <ol className="list-decimal list-inside space-y-1 text-blue-700">
                <li>Click the chat button (bottom right)</li>
                <li>Send your first message</li>
                <li>A conversation will be created automatically</li>
                <li>Wait for an admin to join</li>
                <li>Chat in real-time!</li>
              </ol>
            </div>
            <div>
              <h3 className="font-medium text-blue-800 mb-2">As Admin:</h3>
              <ol className="list-decimal list-inside space-y-1 text-blue-700">
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Current Test User</h2>
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
              userRole === 'CANDIDATE' ? 'bg-green-500' : 'bg-blue-500'
            }`}>
              {userName.charAt(0)}
            </div>
            <div>
              <h3 className="font-medium">{userName}</h3>
              <p className="text-sm text-gray-600">Role: {userRole}</p>
              <p className="text-sm text-gray-600">User ID: {userId}</p>
            </div>
          </div>
        </div>

        {/* Backend Connection Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Backend Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Spring Boot API</span>
              <span className="text-sm text-gray-600">http://localhost:8080</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Socket.IO Server</span>
              <span className="text-sm text-gray-600">http://localhost:9092</span>
            </div>
          </div>
        </div>

        {/* Test Area */}
        {userRole === 'ADMIN' ? (
          <AdminChatPanel adminId={userId} adminName={userName} />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Candidate Test Area</h2>
            <p className="text-gray-600 mb-4">
              As a candidate, you'll see the chat widget in the bottom right corner. 
              Click it to start a conversation with support.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">🔧 Backend Services</h4>
              <div className="space-y-1 text-sm">
                <div>REST API: <span className="text-sm text-gray-600">{process.env.REACT_APP_API_URL || 'http://localhost:8080'}</span></div>
                <div>Socket.io: <span className="text-sm text-gray-600">{process.env.REACT_APP_SOCKET_URL || 'http://localhost:9092'}</span></div>
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