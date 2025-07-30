import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
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

interface ChatWidgetProps {
  userId: number;
  userName: string;
  userRole: 'CANDIDATE' | 'ADMIN';
}

// Message component with dynamic timestamp
function MessageBubble({ message, userId }: { message: Message; userId: number }) {
  const dynamicTime = useDynamicTime(message.createdAt, true);
  
  return (
    <div
      className={`flex ${
        message.senderId === userId ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-xs px-3 py-2 rounded-lg ${
          message.messageType === 'system'
            ? 'bg-yellow-100 text-yellow-800 text-center text-xs'
            : message.senderId === userId
            ? 'bg-blue-600 text-white'
            : 'bg-white border border-gray-200'
        }`}
      >
        {message.messageType !== 'system' && message.senderId !== userId && (
          <div className="text-xs text-gray-500 mb-1">
            {message.senderName} ({message.senderRole})
          </div>
        )}
        <div className="text-sm">{message.content}</div>
        {message.messageType !== 'system' && (
          <div
            className={`text-xs mt-1 ${
              message.senderId === userId ? 'text-blue-200' : 'text-gray-400'
            }`}
          >
            {dynamicTime}
          </div>
        )}
      </div>
    </div>
  );
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ userId, userName, userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Socket.io connection
  useEffect(() => {
    if (!isOpen) return; // Only connect when widget is open

    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:9092';
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('🎉 Connected to Socket.IO server');
      setIsConnected(true);
      
      // Join chat as soon as connected
      setIsLoading(true);
      newSocket.emit('join_chat', { userId }, (response: any) => {
        setIsLoading(false);
        if (response.success) {
          setConversation(response.conversation);
          setMessages(response.messages || []);
          console.log('✅ Joined chat successfully:', response.conversation);
        } else {
          console.error('❌ Failed to join chat:', response.error);
        }
      });
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from Socket.IO server');
      setIsConnected(false);
    });

    newSocket.on('new_message', (messageData: Message) => {
      console.log('📨 New message received:', messageData);
      setMessages(prev => [...prev, messageData]);
    });

    newSocket.on('admin_assigned', (conversationData: Conversation) => {
      console.log('👨‍💼 Admin assigned:', conversationData);
      setConversation(conversationData);
      // Add system message
      const systemMessage: Message = {
        id: Date.now(),
        senderId: 0,
        senderName: 'System',
        senderRole: 'SYSTEM',
        content: `${conversationData.adminName} has joined the conversation`,
        createdAt: new Date().toISOString(),
        messageType: 'system'
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    newSocket.on('conversation_closed', (data: any) => {
      console.log('🔒 Conversation closed:', data);
      const systemMessage: Message = {
        id: Date.now(),
        senderId: 0,
        senderName: 'System',
        senderRole: 'SYSTEM',
        content: data.message,
        createdAt: new Date().toISOString(),
        messageType: 'system'
      };
      setMessages(prev => [...prev, systemMessage]);
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
      setSocket(null);
      setIsConnected(false);
    };
  }, [isOpen, userId]); // Keep dependencies but add proper cleanup

  const sendMessage = () => {
    if (!socket || !newMessage.trim() || !isConnected) return;

    console.log('📤 Sending message:', newMessage);
    socket.emit('send_message', { content: newMessage.trim() }, (response: any) => {
      if (response.success) {
        console.log('✅ Message sent successfully');
        setNewMessage('');
      } else {
        console.error('❌ Failed to send message:', response.error);
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const closeChat = () => {
    if (socket && isConnected) {
      socket.emit('close_conversation', {}, (response: any) => {
        console.log('🔒 Chat closed:', response);
      });
      socket.disconnect();
      setSocket(null);
    }
    setIsOpen(false);
    setMessages([]);
    setConversation(null);
    setIsConnected(false);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-96 bg-white border border-gray-300 rounded-lg shadow-xl flex flex-col z-50">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Support Chat</h3>
              <p className="text-xs opacity-90">
                {isConnected ? (
                  conversation?.adminName ? (
                    `Chatting with ${conversation.adminName}`
                  ) : (
                    'Waiting for support agent...'
                  )
                ) : (
                  'Connecting...'
                )}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <button onClick={closeChat} className="hover:bg-blue-700 p-1 rounded">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-gray-500">Connecting to chat...</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Start a conversation!</p>
                <p className="text-xs">Send a message and we'll connect you with support.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} userId={userId} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={!isConnected}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || !isConnected}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget; 