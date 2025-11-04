import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axios';
import { BellIcon, BellSlashIcon } from '@heroicons/react/24/outline';

interface SubscriptionStatus {
  isSubscribed: boolean;
  preferences: {
    jobNotifications?: boolean;
    bulkEmails?: boolean;
  };
}

const SubscriptionToggle: React.FC = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/subscriptions/status');
      setSubscriptionStatus(response.data);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      toast.error('Failed to load subscription status');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (toggling) return;
    
    try {
      setToggling(true);
      const isCurrentlySubscribed = subscriptionStatus?.isSubscribed;
      
      if (isCurrentlySubscribed) {
        await axiosInstance.post('/subscriptions/unsubscribe');
        toast.success('Successfully unsubscribed from job notifications');
      } else {
        await axiosInstance.post('/subscriptions/subscribe');
        toast.success('Successfully subscribed to job notifications');
      }
      
      await fetchSubscriptionStatus();
    } catch (error: any) {
      console.error('Error toggling subscription:', error);
      toast.error(error.response?.data?.message || 'Failed to update subscription');
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  const isSubscribed = subscriptionStatus?.isSubscribed || false;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] rounded-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isSubscribed ? (
            <BellIcon className="h-6 w-6 text-green-500 dark:text-green-400" />
          ) : (
            <BellSlashIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
          )}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Job Notifications
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isSubscribed 
                ? 'You are subscribed to receive notifications about new job postings'
                : 'Subscribe to receive notifications about new job postings'}
            </p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 ${
            isSubscribed 
              ? 'bg-indigo-600 dark:bg-indigo-500' 
              : 'bg-gray-200 dark:bg-gray-600'
          } ${toggling ? 'opacity-50 cursor-not-allowed' : ''}`}
          role="switch"
          aria-checked={isSubscribed}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isSubscribed ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default SubscriptionToggle;

