import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { UserIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useToast } from "../hooks/use-toast";
import { useDynamicTime } from "../hooks/use-dynamic-time";

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

interface ConversationCardProps {
  conversation: Conversation;
  type: "active" | "unassigned";
  onAssign?: (conversationId: number) => void;
  onReply?: (conversation: Conversation) => void;
}

export function ConversationCard({ conversation, type, onAssign, onReply }: ConversationCardProps) {
  const [firstMessage, setFirstMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Use dynamic time for conversation timestamp
  const dynamicTime = useDynamicTime(conversation.createdAt, true);

  // Load the first message for conversations without lastMessage
  useEffect(() => {
    if (!conversation.lastMessage) {
      loadFirstMessage();
    }
  }, [conversation.id, conversation.lastMessage]);

  const loadFirstMessage = async () => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      
      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      }
      
      const response = await fetch(`${apiUrl}/api/chat/conversations/${conversation.id}/messages`, {
        method: 'GET',
        headers: headers,
      });
      
      if (response.ok) {
        const messages = await response.json();
        if (messages.length > 0) {
          setFirstMessage(messages[0].content);
        }
      } else {
        console.error('Failed to load first message:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to load first message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignClick = () => {
    if (onAssign) {
      onAssign(conversation.id);
    }
  };

  const handleReplyClick = () => {
    if (onReply) {
      onReply(conversation);
    }
  };

  // Generate avatar initials from candidate name
  const getAvatarInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get the message to display
  const getDisplayMessage = () => {
    if (conversation.lastMessage) {
      return conversation.lastMessage;
    }
    if (firstMessage) {
      return firstMessage;
    }
    if (isLoading) {
      return "Loading message...";
    }
    // Show "Waiting for your support" for unassigned conversations without messages
    if (type === "unassigned") {
      return "Waiting for your support";
    }
    return "No recent messages";
  };

  return (
    <Card className="p-4 hover:shadow-md dark:hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] transition-all duration-200 border-l-4 border-l-blue-500 dark:border-l-blue-400 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {/* Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-md">
            {conversation.avatar || getAvatarInitials(conversation.candidateName)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {conversation.candidateName}
              </h4>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">
                {dynamicTime}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {getDisplayMessage()}
            </p>
            {conversation.unreadCount && conversation.unreadCount > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 mt-2">
                {conversation.unreadCount} unread
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-3">
          {type === "unassigned" ? (
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600" 
              onClick={handleAssignClick}
            >
              <UserIcon className="h-3 w-3 mr-1" />
              Support
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600" 
              onClick={handleReplyClick}
            >
              <ChatBubbleLeftRightIcon className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
} 