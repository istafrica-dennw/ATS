import React from 'react';
import { useGeolocation } from '../../hooks/useGeolocation';
import PrivacyPolicyPage from '../../pages/PrivacyPolicyPage';
import EUPrivacyPolicyPage from '../../pages/EUPrivacyPolicyPage';

const PrivacyPolicyRouter: React.FC = () => {
  const { isEU, loading } = useGeolocation();

  // Show loading state while detecting region
  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show EU Privacy Policy for EU users, regular Privacy Policy for others
  return isEU ? <EUPrivacyPolicyPage /> : <PrivacyPolicyPage />;
};

export default PrivacyPolicyRouter;

