import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import { toast } from 'react-toastify';
import { ShieldCheckIcon, ShieldExclamationIcon, QrCodeIcon, KeyIcon } from '@heroicons/react/24/outline';
import { ShieldCheckIcon as ShieldCheckSolidIcon } from '@heroicons/react/24/solid';

const TwoFactorAuthDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [disableVerificationCode, setDisableVerificationCode] = useState('');

  // Fetch current 2FA status on component mount
  useEffect(() => {
    const fetch2FAStatus = async () => {
      try {
        const response = await axiosInstance.get('/auth/2fa/status');
        setIsEnabled(response.data.enabled || false);
      } catch (error) {
        console.error('Error fetching 2FA status:', error);
        toast.error('Failed to fetch 2FA status');
      } finally {
        setIsLoading(false);
      }
    };

    fetch2FAStatus();
  }, []);

  const handleEnable2FA = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post('/auth/2fa/setup');
      setQrCode(response.data.qrCode);
      setSecretKey(response.data.secretKey);
      setShowSetupModal(true);
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      toast.error('Failed to set up 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (!verificationCode) {
      toast.error('Please enter the verification code');
      return;
    }

    try {
      setIsVerifying(true);
      await axiosInstance.post('/auth/2fa/verify', { code: verificationCode });
      setIsEnabled(true);
      setShowSetupModal(false);
      toast.success('2FA has been enabled successfully');
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      toast.error('Invalid verification code');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!disableVerificationCode) {
      toast.error('Please enter the verification code');
      return;
    }

    try {
      setIsDisabling(true);
      await axiosInstance.post('/auth/2fa/disable', { code: disableVerificationCode });
      setIsEnabled(false);
      setShowDisableModal(false);
      toast.success('2FA has been disabled successfully');
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast.error('Invalid verification code');
    } finally {
      setIsDisabling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h2>
              {isEnabled ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <ShieldCheckSolidIcon className="h-5 w-5 mr-1" />
                  Enabled
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  <ShieldExclamationIcon className="h-5 w-5 mr-1" />
                  Disabled
                </span>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Current Status</h3>
                <p className="text-gray-600">
                  {isEnabled
                    ? 'Two-factor authentication is currently enabled for your account. This adds an extra layer of security to your account.'
                    : 'Two-factor authentication is currently disabled. Enable it to add an extra layer of security to your account.'}
                </p>
              </div>

              {isEnabled ? (
                <div className="space-y-4">
                  <button
                    onClick={() => setShowDisableModal(true)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <ShieldExclamationIcon className="h-5 w-5 mr-2" />
                    Disable 2FA
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={handleEnable2FA}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <ShieldCheckIcon className="h-5 w-5 mr-2" />
                    Enable 2FA
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Setup Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Set Up Two-Factor Authentication</h3>
            <div className="space-y-4">
              <div className="text-center">
                <img src={qrCode} alt="QR Code" className="mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">Scan this QR code with your authenticator app</p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <KeyIcon className="h-4 w-4" />
                  <span>Secret Key: {secretKey}</span>
                </div>
              </div>
              <div>
                <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter 6-digit code"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowSetupModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyAndEnable}
                  disabled={isVerifying}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isVerifying ? 'Verifying...' : 'Verify and Enable'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disable Modal */}
      {showDisableModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Disable Two-Factor Authentication</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="disable-verification-code" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="disable-verification-code"
                  value={disableVerificationCode}
                  onChange={(e) => setDisableVerificationCode(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter 6-digit code"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDisableModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisable2FA}
                  disabled={isDisabling}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {isDisabling ? 'Disabling...' : 'Disable 2FA'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoFactorAuthDashboard; 