import React from 'react';
import { useGeolocation } from '../../hooks/useGeolocation';
import PrivacyPolicyPage from '../../pages/PrivacyPolicyPage';
import EUPrivacyPolicyPage from '../../pages/EUPrivacyPolicyPage';

/**
 * Privacy Policy Router Component
 * 
 * Routes to the appropriate Privacy Policy based on:
 * 1. Subdomain detection: If hostname contains "ist.com" → EU Privacy Policy
 * 2. IP geolocation: If IP is from EU region → EU Privacy Policy
 * 3. Otherwise → Regular Privacy Policy
 * 
 * Uses useGeolocation hook which checks subdomain first, then falls back to IP detection
 */
const PrivacyPolicyRouter: React.FC = () => {
  const { isEU, loading } = useGeolocation();

  // Show loading state while detecting region (subdomain or IP)
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

  // Show EU Privacy Policy if:
  // - Subdomain contains "ist.com" OR
  // - IP geolocation detects EU region
  // Otherwise show regular Privacy Policy
  return isEU ? <EUPrivacyPolicyPage /> : <PrivacyPolicyPage />;
};

export default PrivacyPolicyRouter;

