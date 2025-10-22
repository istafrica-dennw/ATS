import React from 'react';
import { useEUAdminSetup } from '../../hooks/useEUAdminSetup';
import { 
  GlobeAltIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserPlusIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const EUAdminSetupCard: React.FC = () => {
  const { status, loading, error, becomeFirstEUAdmin, assignEURegion } = useEUAdminSetup();

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="flex items-center text-red-600 dark:text-red-400">
          <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
          <span className="font-medium">Error loading EU admin setup</span>
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const handleBecomeFirstEUAdmin = async () => {
    const success = await becomeFirstEUAdmin();
    if (success) {
      // Component will automatically refresh via the hook
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 p-6">
      <div className="flex items-center mb-4">
        <ShieldCheckIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          EU Admin Setup
        </h3>
      </div>

      {/* Current Status */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">EU Admin Exists:</span>
          <span className={`text-sm font-medium ${status.hasEUAdmin ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {status.hasEUAdmin ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">EU Access:</span>
          <span className={`text-sm font-medium ${status.isEUAccess ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
            {status.isEUAccess ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Your Region:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {status.currentUserRegion || 'Not set'}
          </span>
        </div>

        {status.clientIP && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Your IP:</span>
            <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
              {status.clientIP}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      {status.canBecomeFirstEUAdmin && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <GlobeAltIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Become First EU Admin
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                You can become the first EU admin since you're accessing from EU and no EU admin exists yet.
              </p>
              <button
                onClick={handleBecomeFirstEUAdmin}
                className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Become EU Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {status.canAssignEURegion && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start">
            <UserPlusIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-green-900 dark:text-green-100">
                EU Admin Privileges
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                You are an EU admin and can assign EU region to other users through user management.
              </p>
            </div>
          </div>
        </div>
      )}

      {!status.canBecomeFirstEUAdmin && !status.canAssignEURegion && (
        <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              EU admin setup is complete or you don't have the required permissions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EUAdminSetupCard;