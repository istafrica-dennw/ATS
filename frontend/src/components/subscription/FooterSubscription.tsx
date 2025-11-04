import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BellIcon } from '@heroicons/react/24/outline';
import axiosInstance from '../../utils/axios';
import { toast } from 'react-toastify';

const FooterSubscription: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async () => {
    if (!isAuthenticated || !user) {
      // If not logged in, redirect to login
      toast.info('Please log in to subscribe to job notifications');
      navigate('/login');
      return;
    }

    try {
      setSubscribing(true);
      await axiosInstance.post('/subscriptions/subscribe');
      toast.success('Successfully subscribed to job notifications!');
    } catch (error: any) {
      console.error('Error subscribing:', error);
      toast.error(error.response?.data?.message || 'Failed to subscribe');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <BellIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
      <button
        onClick={handleSubscribe}
        disabled={subscribing}
        className="text-sm font-medium text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {subscribing ? 'Subscribing...' : 'Subscribe to Job Notifications'}
      </button>
    </div>
  );
};

export default FooterSubscription;

