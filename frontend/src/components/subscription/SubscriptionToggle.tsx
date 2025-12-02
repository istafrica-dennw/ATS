import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axios';
import { BellIcon, BellSlashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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
      toast.error('Failed to load subscription status for future opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleClick = () => {
    if (toggling) return;
    
    const isCurrentlySubscribed = subscriptionStatus?.isSubscribed;
    
    if (isCurrentlySubscribed) {
      // Unsubscribing - no confirmation needed
      performToggle(false);
    } else {
      // Subscribing - show confirmation modal
      setShowConfirmModal(true);
    }
  };

  const performToggle = async (subscribe: boolean) => {
    try {
      setToggling(true);
      setShowConfirmModal(false);
      
      if (subscribe) {
        await axiosInstance.post('/subscriptions/subscribe');
        toast.success('Successfully subscribed to future opportunities');
      } else {
        await axiosInstance.post('/subscriptions/unsubscribe');
        toast.success('Successfully unsubscribed from future opportunities');
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
    <>
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
                Subscribe to Future Opportunities
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isSubscribed 
                  ? 'You are subscribed to receive notifications about future job opportunities'
                  : 'Subscribe to receive notifications about future job opportunities'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleClick}
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

      {/* Subscription Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity" 
              aria-hidden="true"
              onClick={() => setShowConfirmModal(false)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="absolute top-0 right-0 pt-4 pr-4 z-10">
                <button
                  type="button"
                  className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setShowConfirmModal(false)}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 sm:mx-0 sm:h-10 sm:w-10">
                    <BellIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100" id="modal-title">
                      Subscribe to Future Opportunities
                    </h3>
                    <div className="mt-4">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          By subscribing, you confirm that you have read the{' '}
                          <Link 
                            to="/privacy-policy" 
                            target="_blank"
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 underline font-medium"
                          >
                            privacy policy
                          </Link>
                          {' '}and agree that IST can contact you directly about specific future job opportunities.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  type="button"
                  onClick={() => performToggle(true)}
                  disabled={toggling}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {toggling ? 'Subscribing...' : 'Subscribe'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubscriptionToggle;
