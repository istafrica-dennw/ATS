import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axiosInstance from '../../utils/axios';
import { toast } from 'react-toastify';

const FooterSubscription: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [subscribing, setSubscribing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSubscribeClick = () => {
    if (!isAuthenticated || !user) {
      // If not logged in, redirect to login
      toast.info('Please log in to subscribe to future opportunities');
      navigate('/login');
      return;
    }
    
    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const performSubscribe = async () => {
    try {
      setSubscribing(true);
      setShowConfirmModal(false);
      await axiosInstance.post('/subscriptions/subscribe');
      toast.success('Successfully subscribed to future opportunities!');
    } catch (error: any) {
      console.error('Error subscribing:', error);
      toast.error(error.response?.data?.message || 'Failed to subscribe');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <BellIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        <button
          onClick={handleSubscribeClick}
          disabled={subscribing}
          className="text-sm font-medium text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {subscribing ? 'Subscribing...' : 'Subscribe to Future Opportunities'}
        </button>
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
                  onClick={performSubscribe}
                  disabled={subscribing}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {subscribing ? 'Subscribing...' : 'Subscribe'}
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

export default FooterSubscription;
