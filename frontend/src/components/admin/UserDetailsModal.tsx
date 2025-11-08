// Enhanced with comprehensive dark mode support and theming
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { UserFormData } from '../../types/user';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import UserDetailsContent from './UserDetailsContent';


interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number | null;
  token: string;
  onUserUpdated: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  userId, 
  token,
  onUserUpdated
}) => {
  const [userData, setUserData] = useState<UserFormData | null>(null);

  const fetchUserDetails = useCallback(async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        toast.error('Failed to load user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Network error when loading user details');
    }
  }, [userId, token]);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails();
    }
  }, [isOpen, userId, fetchUserDetails]);

  const handleUserUpdated = () => {
    onUserUpdated();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900/75 bg-opacity-75 transition-opacity" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-5xl rounded-xl bg-white dark:bg-gray-800 text-left shadow-xl dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 w-full flex flex-col max-h-[90vh]">
          <div className="dark:bg-gray-800 px-6 pt-5 pb-5 sm:px-8 sm:pt-6 sm:pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {userData ? `User Details: ${userData.firstName} ${userData.lastName}` : 'Loading User Details...'}
              </Dialog.Title>
              <button
                type="button"
                className="rounded-lg bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                onClick={onClose}
              >
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto px-6 pt-5 pb-5 sm:px-8 sm:pt-6 sm:pb-4 flex-1">
            <UserDetailsContent 
              userId={userId?.toString() || null}
              token={token}
              onUserUpdated={handleUserUpdated}
            />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default UserDetailsModal; 